// 存量项目的组件采用体检（issue #43）。
//
// 与另外两个能力的分工，三者不得互相冒充：
//   inspect_project        装没装对             —— 事实
//   validate_hulian_usage  改动有没有违反硬规则 —— 可静态证明的错误
//   auditAdoption（本文件）该用没用上、从哪改起 —— **带置信度的建议**
//
// 所以这里的输出一律是建议，不产生 error、不阻断。可静态证明的错误仍归 @hulianui/guard。
//
// 扫描边界（安全 > 完整）——注意这里比 project.mjs 更宽，必须显式设限：
//   · project.mjs 只读已知路径的配置文件；本文件**必须**递归源码树，否则无从谈采用率
//   · 只读代码扩展名（.tsx/.ts/.jsx/.js），跳过 node_modules / 构建产物 / .git
//   · 绝不读 .env、凭证、二进制
//   · 只读不写。基线要落盘由调用方决定（CLI 的 --write-baseline），本文件不碰文件系统写入
//   · 有文件数上限，超了如实报 truncated —— 静默截断会让「扫过了」变成假话
//
// 判定原则（对应 #43 的验收标准）：
//   · 「有场景没采用」与「没这个场景」必须分开。判据是**同项目内的邻近信号**：
//     一个 role 组里已经用了东西却缺关键件 = 机会点；整组一件没有 = 这个项目没这个场景，
//     不报。这条直接决定了中后台项目不会被推一堆 decoration。
//   · 风险项不得见 <div>/<button> 就判错。图标热区、asChild、桌面端自定义控件都可能合理，
//     所以每条带 confidence + 判断依据，由人/模型自己决定信不信。

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { getModifier, getSurface, listModifiers, listSurfaces, loadProfiles } from "./profiles.mjs";
import { inspectProject } from "./project.mjs";

/** 扫描上限。真实消费项目实测 300–3000 个代码文件，5000 给足余量又不至于扫穿 monorepo。 */
const MAX_FILES = 5000;

const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  ".output",
  "dist",
  "build",
  "out",
  "coverage",
  "src-tauri",
  "target",
  "public",
  "vendor",
  "__snapshots__",
]);

const CODE_EXT = /\.(tsx|ts|jsx|js|mjs)$/;
const JSX_EXT = /\.(tsx|jsx)$/;

/**
 * 原型信号。同产品的 demo 原型（5069tk）与正式系统（5069tk-app）在 12 个企业高层业务
 * 组件上是 5/12 与 10/12 —— 差距是**取向不同**，不是采用不足。给原型推荐全套企业件
 * 是过度工程（见 docs/agent-adoption-baseline-2026-08-01.md 发现一）。
 *
 * 但「这是不是原型」是产品判断，代码里没有可靠信号，所以这里**只提示不自动切换**：
 * 在项目自己的说明文件里找到自述才提一句「像原型，要不要传 workflow=prototype」。
 * 静默按原型处理会走向另一个极端 —— 把正式系统的真缺口一并压掉。
 */
const PROTOTYPE_HINT_FILES = ["CLAUDE.md", "AGENTS.md", "README.md"];
const PROTOTYPE_HINT_RE = /(?:纯前端)?(?:demo|原型|prototype|mock\s*only|需求回看)/i;

/**
 * 花括号内不会嵌套，用 [^{}] 而非 [\s\S] —— 后者会跨过上一条 import 的收尾花括号，
 * 把 react 的 useState/useEffect 一并算成瑚琏组件。
 */
const IMPORT_RE = /import\s+(type\s+)?\{([^{}]*?)\}\s*from\s*["'](@hulianui\/[^"']+)["']/g;

// --------------------------------------------------------------- 风险规则 --

/**
 * 手搓信号：本该用现成能力，却退回原生标签或内联样式。
 *
 * `baseConfidence` 是**未看上下文时**的先手判断，之后由 refine 逐条升降 ——
 * 裸 <table> 几乎一定该用 Table，裸 <button> 则大概率是图标热区。把这两条给同一个
 * 置信度，就是 #43 说的「一律标红」，审计会立刻失去可信度。
 */
const RISK_RULES = [
  {
    id: "bare-table",
    should: "Table / ProTable",
    re: /<table[\s>]/g,
    baseConfidence: "high",
    why: "原生 table 拿不到排序 / 分页 / 冻结列 / 密度，且样式与主题脱节",
  },
  {
    id: "bare-dialog",
    should: "Dialog / Modal",
    re: /<dialog[\s>]/g,
    baseConfidence: "high",
    why: "原生 dialog 的焦点陷阱与滚动锁定行为跨浏览器不一致",
  },
  {
    id: "handmade-overlay",
    should: "Dialog / Drawer / Popover",
    re: /className=["'][^"']*fixed\s+inset-0/g,
    baseConfidence: "medium",
    why: "自制遮罩通常缺焦点陷阱、Esc 关闭、滚动锁定与 aria",
  },
  {
    id: "bare-select",
    should: "Select",
    re: /<select[\s>]/g,
    baseConfidence: "medium",
    why: "原生 select 无法定制选项渲染，且移动端表现不受控",
  },
  {
    id: "bare-textarea",
    should: "Textarea / Field",
    re: /<textarea[\s>]/g,
    baseConfidence: "medium",
    why: "缺自适应高度、计数与 Field 的错误态联动",
  },
  {
    id: "bare-input",
    should: "Input / Field",
    re: /<input[\s>]/g,
    baseConfidence: "medium",
    why: "缺 Field 的 label / 错误态 / 描述联动，无障碍要自己补",
  },
  {
    id: "bare-button",
    should: "Button",
    re: /<button[\s>]/g,
    baseConfidence: "low",
    why: "多数是图标热区或自定义控件，属正当用法；只有承担主要动作时才该换 Button",
  },
  {
    id: "inline-style",
    should: "语义 token / 组件 prop",
    re: /\sstyle=\{\{/g,
    baseConfidence: "low",
    why: "动态定位 / 计算尺寸用内联样式是正当的；只有写死颜色与间距才是问题",
  },
  {
    id: "hardcoded-color",
    should: "语义 token",
    re: /(?:text|bg|border|from|to|via|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g,
    baseConfidence: "high",
    why: "硬编码颜色不跟随明暗主题，换肤时必然失真",
  },
];

/** 上游缺口信号：这些写法通常意味着「组件差点能力，于是在业务侧绕过去了」。 */
const GAP_RULES = [
  {
    id: "css-override-hulian",
    re: /\[&_\[data-slot=|\[&_\.hulian|!important/g,
    why: "用选择器穿透或 !important 改瑚琏内部结构 —— 组件缺 prop 的典型绕法",
  },
  {
    id: "local-ui-shadow",
    re: /from\s+["'](?:\.{1,2}\/)+components\/ui\//g,
    why: "本地 components/ui/ 与瑚琏并存，可能是把某个组件重写了一份",
  },
];

// --------------------------------------------------------------- 文件扫描 --

function walk(dir, acc, base) {
  if (acc.length >= MAX_FILES) return acc;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (acc.length >= MAX_FILES) return acc;
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    if (SKIP_DIR.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, acc, base);
    else if (CODE_EXT.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      acc.push(relative(base, path).split(sep).join("/"));
    }
  }
  return acc;
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** 取命中处所在行，压成单行片段 —— 报给人看要能一眼认出位置，但不能把整段代码倒出来。 */
function snippetAt(text, index, max = 120) {
  const start = text.lastIndexOf("\n", index) + 1;
  let end = text.indexOf("\n", index);
  if (end === -1) end = text.length;
  const line = text.slice(start, end).trim();
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

// ------------------------------------------------------------- 风险置信度 --

/**
 * 按上下文升降单条风险的置信度。这是「不一律标红」的落点。
 *
 * 只用**能从文本稳定读出**的证据，不做语义猜测：拿不准就维持 base，并说明为什么，
 * 让调用方自己判断 —— 猜错方向比不猜更糟。
 */
function refineRisk(rule, { text, index, snippet, file, usesHulian }) {
  const reasons = [];
  let confidence = rule.baseConfidence;

  const window = text.slice(Math.max(0, index - 200), index + 400);
  const bump = (to, why) => {
    confidence = to;
    reasons.push(why);
  };

  if (rule.id === "bare-button") {
    if (/asChild/.test(window)) bump("low", "邻近有 asChild，多半是把子元素当触发器，属正当用法");
    else if (/aria-label=|sr-only/.test(snippet) && /<(svg|[A-Z]\w*Icon)/.test(window))
      bump("low", "带 aria-label 的图标按钮，是正当的图标热区");
    else if (/<(svg|[A-Z]\w*Icon|Icon[A-Z])/.test(window) && snippet.length < 90)
      bump("low", "短标签且邻近是图标，多半是图标热区");
    else if (/(type=["']submit|onSubmit)/.test(window))
      bump("high", "承担表单提交这类主要动作，应当用 Button");
    else if (/className=["'][^"']{60,}/.test(snippet))
      bump("medium", "className 很长，像是在手工复刻按钮外观");
  }

  if (rule.id === "inline-style") {
    if (/style=\{\{\s*(?:--|[a-zA-Z]+:\s*`|width|height|top|left|right|bottom|transform|gridTemplate)/.test(window))
      bump("low", "写的是动态定位 / 尺寸 / CSS 变量，属正当用法");
    else if (/style=\{\{[^}]*(?:color|background|border)\s*:\s*["'#]/.test(window))
      bump("high", "内联写死了颜色，会绕开主题 token");
  }

  if (rule.id === "bare-input") {
    if (/type=["'](?:file|hidden|checkbox|radio)["']/.test(snippet))
      bump("low", "file / hidden / checkbox 类原生 input 常需直接使用");
  }

  if (rule.id === "handmade-overlay" && /role=["']dialog|aria-modal/.test(window)) {
    bump("low", "已自行补了 dialog 语义，可能是有意为之的自定义浮层");
  }

  // 整个文件都没引入瑚琏 —— 这更可能是「这块还没接入」，不是「绕过了组件库」。
  // 两者的处置动作完全不同，混为一谈会让迁移计划排错优先级。
  if (!usesHulian && confidence === "high") {
    bump("medium", "该文件完全没有引入瑚琏，属未接入而非绕过，先看是否该整体迁移");
  }

  return { confidence, reasons, file };
}

// --------------------------------------------------------------- 场景判定 --

const CONFIDENCE_ORDER = { low: 0, medium: 1, high: 2 };

/**
 * 给一个 surface / modifier 打分。
 *
 * 三类判据权重不同，理由写在 agent-profiles.json 的 detectNote 里：
 * components 是「项目真的 import 了」的事实，最强；deps 次之；paths 最弱 ——
 * 目录叫 /dashboard 只是约定，不构成事实。
 */
function scoreProfile(detect, { usedSlugs, files, deps }) {
  if (!detect) return null;
  const evidence = [];
  let score = 0;

  const hitComponents = (detect.components ?? []).filter((slug) => usedSlugs.has(slug));
  if (hitComponents.length) {
    score += hitComponents.length * 3;
    evidence.push(`已使用 ${hitComponents.join("、")}`);
  }

  const hitDeps = (detect.deps ?? []).filter((dep) => deps[dep]);
  if (hitDeps.length) {
    score += hitDeps.length * 2;
    evidence.push(`依赖 ${hitDeps.join("、")}`);
  }

  const hitPaths = (detect.paths ?? []).filter((frag) =>
    files.some((file) => `/${file}`.includes(frag)),
  );
  if (hitPaths.length) {
    score += hitPaths.length;
    evidence.push(`路由/目录含 ${hitPaths.join("、")}`);
  }

  if (!score) return null;
  const confidence =
    hitComponents.length >= 3 || (hitDeps.length && hitComponents.length)
      ? "high"
      : hitComponents.length || hitPaths.length >= 2
        ? "medium"
        : "low";
  return { score, confidence, evidence };
}

function detectScene({ usedSlugs, files, deps, surfaceOverride, modifiersOverride }) {
  // 先比置信度再比分数。只按分数排会让「Tauri 依赖 + 命令面板」（结构性事实，high）
  // 输给「碰巧用了两个配置类小件」（medium）—— 算了置信度却不拿它排序，是自相矛盾。
  const surfaces = listSurfaces()
    .map((s) => ({ id: s.id, ...(scoreProfile(s.detect, { usedSlugs, files, deps }) ?? {}) }))
    .filter((s) => s.score)
    .sort(
      (a, b) =>
        CONFIDENCE_ORDER[b.confidence] - CONFIDENCE_ORDER[a.confidence] || b.score - a.score,
    );

  const modifiers = listModifiers()
    .map((m) => ({ id: m.id, ...(scoreProfile(m.detect, { usedSlugs, files, deps }) ?? {}) }))
    .filter((m) => m.score);

  const top = surfaces[0] ?? null;
  const runnerUp = surfaces[1] ?? null;
  // 头名与次名咬得很紧时降级：这种项目多半横跨两个形态，报一个 high 是虚假的确定性
  if (top && runnerUp && top.score - runnerUp.score <= 2 && top.confidence === "high") {
    top.confidence = "medium";
    top.evidence.push(`与 ${runnerUp.id} 得分接近（${top.score} vs ${runnerUp.score}），不排除横跨两种形态`);
  }

  return {
    surface: surfaceOverride
      ? { id: surfaceOverride, confidence: "high", evidence: ["由调用方显式指定"], overridden: true }
      : top,
    modifiers: modifiersOverride
      ? modifiersOverride.map((id) => ({
          id,
          confidence: "high",
          evidence: ["由调用方显式指定"],
          overridden: true,
        }))
      : modifiers,
    surfaceCandidates: surfaces,
  };
}

// --------------------------------------------------------------- 机会点 --

/**
 * 机会点 = **有场景但没采用**。
 *
 * 判据是同项目内的邻近信号，而不是「profile 里有、你没用」——后者会把库存结构
 * （91 个 decoration 只有一个项目需要）报成采用缺口，正撞 #41 自己写的非目标。
 *
 *   surface  ：一个 componentRoles 组里已经用了东西，却缺组里的其它件 → 报；
 *             整组一件没有 → 这个项目没这个场景，不报。
 *   modifier ：整个 modifier 被判定成立，才看它的 require / consider。
 *             require 缺 = 这个形态下的硬缺陷（high）；consider 缺 = 值得考虑（medium）。
 */
function findOpportunities({ surface, modifiers, usedSlugs, slugMeta }) {
  const out = [];
  const seen = new Set();

  /**
   * surface 决定组件语言 —— 所以 modifier 的建议**不得越过 surface 的边界**。
   *
   * 实证：ins-admin（运维后台）在登录页用了 aurora-text / shimmer-button，marketing
   * modifier 因此成立，于是它的 consider 列表把 border-beam / shine-border 一路推了进来。
   * 但 admin-console 的 avoid 第一条就是「为了覆盖率加入营销背景或 WebGL 特效」。
   * 这正是基线文档警告的「把库存结构问题算成采用失败，导出往中后台塞特效的结论」。
   * avoidCategories 是那条自由文本 avoid 的机器可判定伴生字段。
   */
  const blocked = new Set(surface?.avoidCategories ?? []);
  const offLanguage = (slug) =>
    (slugMeta.get(slug)?.categories ?? []).some((cat) => blocked.has(cat));

  const push = (entry) => {
    if (seen.has(entry.slug)) return;
    if (offLanguage(entry.slug)) return;
    seen.add(entry.slug);
    out.push(entry);
  };

  if (surface) {
    for (const [role, list] of Object.entries(surface.componentRoles ?? {})) {
      const used = list.filter((slug) => usedSlugs.has(slug));
      const missing = list.filter((slug) => !usedSlugs.has(slug));
      // 邻近信号：这一组一件都没用 → 该项目没这个场景，跳过，不当采用缺口
      if (!used.length || !missing.length) continue;
      for (const slug of missing) {
        push({
          slug,
          from: `surface:${surface.id}/${role}`,
          confidence: used.length >= 2 ? "medium" : "low",
          nearby: used,
          reason:
            `同一「${role}」职责里已经用了 ${used.join("、")}，但缺 ${slug}` +
            `（${slugMeta.get(slug)?.description ?? "见组件文档"}）`,
        });
      }
    }
  }

  for (const mod of modifiers) {
    const def = getModifier(mod.id);
    if (!def) continue;
    for (const slug of def.require ?? []) {
      if (usedSlugs.has(slug)) continue;
      // require 组内是「都要」而非「二选一」，所以兄弟件在用是**加强**证据（说明这个形态
      // 确实成立），不是「需求已被覆盖」。曾经把它写成降级条件，读反了 —— TabBar 吃底部
      // 安全区不代表 SafeArea 可省，刘海那一侧照样贴边。
      const siblings = (def.require ?? []).filter((s) => s !== slug && usedSlugs.has(s));
      push({
        slug,
        from: `modifier:${mod.id}/require`,
        confidence: "high",
        nearby: siblings,
        reason:
          `判定为 ${mod.id} 形态（${mod.evidence.join("；")}），该形态下 ${slug} 是必备件` +
          (siblings.length ? `；同组的 ${siblings.join("、")} 已在用，佐证这个形态成立` : ""),
      });
    }
    for (const slug of def.consider ?? []) {
      if (usedSlugs.has(slug)) continue;
      push({
        slug,
        from: `modifier:${mod.id}/consider`,
        confidence: "medium",
        nearby: [],
        reason: `判定为 ${mod.id} 形态，${slug} 值得评估（${slugMeta.get(slug)?.description ?? "见组件文档"}）`,
      });
    }
  }

  return out.sort((a, b) => CONFIDENCE_ORDER[b.confidence] - CONFIDENCE_ORDER[a.confidence]);
}

// ------------------------------------------------------------- 迁移计划 --

/**
 * 按收益/风险排序的渐进计划。刻意做得**短**：存量项目第一次体检出几百条，
 * 唯一的结果是被整体忽略。所以每档只取头部，并且明确说「先做哪一步」。
 */
function buildPlan({ risks, opportunities, highLevel, context, workflow }) {
  const plan = [];
  const byId = (id) => risks.filter((r) => r.id === id && r.confidence === "high");
  const prototype = workflow === "prototype";

  if (context.behind) {
    plan.push({
      title: `先升级 @hulianui/ui：声明 ${context.ui.declared} → 最新 ${context.latest ?? "?"}`,
      why: "版本落后时，下面所有建议里都可能有你这一版还装不到的件。先对齐版本，后面的改造才不会白做",
      effort: "低",
      risk: "中",
      targets: [],
    });
  }

  const structural = [...byId("bare-table"), ...byId("bare-dialog")];
  if (structural.length) {
    plan.push({
      title: `替换 ${structural.length} 处自制表格 / 弹窗`,
      why: "收益最大且语义等价：Table / Dialog 直接补上排序分页、焦点陷阱与主题联动，业务行为不用动",
      effort: "中",
      risk: "低",
      targets: [...new Set(structural.map((r) => r.file))].slice(0, 8),
    });
  }

  const colors = byId("hardcoded-color");
  if (colors.length) {
    plan.push({
      title: `把 ${colors.length} 处硬编码颜色换成语义 token`,
      why: "纯样式改动、可逐文件推进、几乎无回归风险，且直接决定暗色模式是否成立",
      effort: "低",
      risk: "低",
      targets: [...new Set(colors.map((r) => r.file))].slice(0, 8),
    });
  }

  const hardMiss = opportunities.filter((o) => o.confidence === "high");
  if (hardMiss.length) {
    plan.push({
      title: `补上当前形态的必备件：${hardMiss.map((o) => o.slug).join("、")}`,
      why: hardMiss[0].reason,
      effort: "中",
      risk: "低",
      targets: [],
    });
  }

  // 原型阶段刻意不推高层企业件：原型求快、正式求规范，是两种正当取向，
  // 把原型判成「采用不足」就是拿正式系统的尺子量它。
  if (!prototype && highLevel.missing.length && highLevel.used.length >= 3) {
    plan.push({
      title: `评估尚未采用的高层业务组件：${highLevel.missing.slice(0, 5).join("、")}`,
      why: `已用 ${highLevel.used.length}/${highLevel.total} 件，说明这类场景确实存在；剩下的逐个评估，但不为凑数硬塞`,
      effort: "中",
      risk: "中",
      targets: [],
    });
  }

  return plan.map((step, i) => ({ order: i + 1, ...step }));
}

// ----------------------------------------------------------------- 主入口 --

/**
 * @param {object} opts
 * @param {string} [opts.projectRoot]  项目根；不传走 inspect_project 的同一套解析
 * @param {object} [opts.registry]     registry.json 内容（由调用方 load 好传入，本文件不碰数据源）
 * @param {string} [opts.surface]      人工覆盖场景判定
 * @param {string[]} [opts.modifiers]  人工覆盖修饰维度
 * @param {object} [opts.baseline]     上次的基线，用于出差异
 */
export function auditAdoption({
  projectRoot: explicit,
  roots,
  cwd,
  registry,
  surface: surfaceOverride,
  modifiers: modifiersOverride,
  workflow = "build",
  baseline: previous,
} = {}) {
  const project = inspectProject({ explicit, roots, cwd });
  const projectRoot = project.projectRoot;

  const ui = (registry?.items ?? []).filter((i) => i.type === "registry:ui");
  const blockNames = new Set(
    (registry?.items ?? []).filter((i) => i.type === "registry:block").map((i) => i.name),
  );
  const slugMeta = new Map(ui.map((i) => [i.name, i]));
  const symbolToSlug = new Map();
  for (const item of ui) {
    for (const ex of item.meta?.exports ?? []) if (!symbolToSlug.has(ex)) symbolToSlug.set(ex, item.name);
  }

  // ------------------------------------------------------------- 扫描 --
  const files = walk(projectRoot, [], projectRoot);
  const truncated = files.length >= MAX_FILES;

  const slugUses = new Map();
  const unmapped = new Set();
  const risks = [];
  const gaps = [];
  const usedBlocks = new Set();
  let filesUsingHulian = 0;

  for (const rel of files) {
    let text;
    try {
      text = readFileSync(join(projectRoot, rel), "utf8");
    } catch {
      continue;
    }

    // 落盘的 block / page 源码按文件名认 —— install_block 是把源码复制进消费项目的
    const stem = rel.split("/").pop().replace(CODE_EXT, "");
    for (const candidate of [stem, `block-${stem}`, `page-${stem}`]) {
      if (blockNames.has(candidate)) usedBlocks.add(candidate);
    }

    const usesHulian = text.includes("@hulianui/");
    if (usesHulian) {
      let hit = false;
      for (const match of text.matchAll(IMPORT_RE)) {
        const typeImport = Boolean(match[1]);
        for (let raw of match[2].split(",")) {
          raw = raw.trim();
          if (!raw) continue;
          let typeOnly = typeImport;
          if (raw.startsWith("type ")) {
            typeOnly = true;
            raw = raw.slice(5).trim();
          }
          if (typeOnly) continue; // 类型导入不等于用了组件
          const name = raw.split(/\s+as\s+/)[0].trim();
          if (!name) continue;
          const slug = symbolToSlug.get(name);
          if (!slug) {
            unmapped.add(name);
            continue;
          }
          slugUses.set(slug, (slugUses.get(slug) ?? 0) + 1);
          hit = true;
        }
      }
      if (hit) filesUsingHulian++;
    }

    if (!JSX_EXT.test(rel)) continue;

    for (const rule of RISK_RULES) {
      for (const match of text.matchAll(rule.re)) {
        const snippet = snippetAt(text, match.index);
        const refined = refineRisk(rule, { text, index: match.index, snippet, file: rel, usesHulian });
        risks.push({
          id: rule.id,
          should: rule.should,
          why: rule.why,
          file: rel,
          line: lineOf(text, match.index),
          snippet,
          confidence: refined.confidence,
          basis: refined.reasons,
        });
      }
    }
    for (const rule of GAP_RULES) {
      for (const match of text.matchAll(rule.re)) {
        gaps.push({
          id: rule.id,
          why: rule.why,
          file: rel,
          line: lineOf(text, match.index),
          snippet: snippetAt(text, match.index),
        });
      }
    }
  }

  const usedSlugs = new Set(slugUses.keys());

  // ------------------------------------------------------- 场景与指标 --
  const deps = {
    ...(readJson(join(projectRoot, "package.json"))?.dependencies ?? {}),
    ...(readJson(join(projectRoot, "package.json"))?.devDependencies ?? {}),
  };
  const scene = detectScene({ usedSlugs, files, deps, surfaceOverride, modifiersOverride });
  const surfaceDef = scene.surface ? getSurface(scene.surface.id) : null;

  const highLevelList = loadProfiles().metrics?.highLevelComponents ?? [];
  const highLevel = {
    used: highLevelList.filter((slug) => usedSlugs.has(slug)),
    missing: highLevelList.filter((slug) => !usedSlugs.has(slug)),
    total: highLevelList.length,
  };
  highLevel.score = `${highLevel.used.length}/${highLevel.total}`;

  const categories = {};
  for (const slug of usedSlugs) {
    for (const cat of slugMeta.get(slug)?.categories ?? ["?"]) {
      categories[cat] = (categories[cat] ?? 0) + 1;
    }
  }

  let opportunities = findOpportunities({
    surface: surfaceDef,
    modifiers: scene.modifiers,
    usedSlugs,
    slugMeta,
  });
  // 原型阶段：surface 的 componentRoles 缺件不算缺口（求快是正当取向）；
  // modifier 的 require 仍保留 —— 那是「这个形态下缺了就是坏的」，原型也一样会贴边。
  if (workflow === "prototype") {
    opportunities = opportunities.filter((o) => !o.from.startsWith("surface:"));
  }

  // 「这是不是原型」是产品判断，不自动切换，只在项目自己写了自述时提一句
  const prototypeHint =
    workflow === "prototype"
      ? null
      : PROTOTYPE_HINT_FILES.map((file) => ({ file, text: readTextIfExists(join(projectRoot, file)) }))
          .filter(({ text }) => text && PROTOTYPE_HINT_RE.test(text))
          .map(({ file }) => file)[0] ?? null;

  // --------------------------------------------------------- 上下文 --
  const uiPkg = project.packages["@hulianui/ui"] ?? {};
  const latest = registry?.version ?? null;
  const context = {
    framework: project.framework,
    packageManager: project.packageManager,
    ui: { declared: uiPkg.declared ?? null, installed: uiPkg.installed ?? null, linkKind: uiPkg.linkKind ?? null },
    latest,
    // link:/workspace: 接入的版本就是工作区源码，无所谓落后
    behind: Boolean(latest && uiPkg.installed && !uiPkg.linkKind && uiPkg.installed !== latest),
    setupWarnings: project.warnings,
  };

  const plan = buildPlan({ risks, opportunities, highLevel, context, workflow });

  // ----------------------------------------------------------- 基线 --
  const snapshot = {
    version: 1,
    highLevelScore: highLevel.score,
    components: [...usedSlugs].sort(),
    risks: Object.fromEntries(
      RISK_RULES.map((r) => [r.id, risks.filter((x) => x.id === r.id && x.confidence !== "low").length]).filter(
        ([, n]) => n,
      ),
    ),
  };
  const diff = previous ? diffBaseline(previous, snapshot) : null;

  return {
    projectRoot,
    projectRootSource: project.projectRootSource,
    scanned: { files: files.length, usingHulian: filesUsingHulian, truncated, limit: MAX_FILES },
    context,
    usage: {
      components: [...slugUses.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([slug, uses]) => ({ slug, uses, categories: slugMeta.get(slug)?.categories ?? [] })),
      blocks: [...usedBlocks].sort(),
      categories: Object.fromEntries(Object.entries(categories).sort((a, b) => b[1] - a[1])),
      highLevel,
      unmappedSymbols: [...unmapped].sort(),
    },
    scene: { ...scene, workflow, prototypeHint },
    opportunities,
    risks: risks.sort((a, b) => CONFIDENCE_ORDER[b.confidence] - CONFIDENCE_ORDER[a.confidence]),
    upstreamGaps: gaps,
    plan,
    baseline: { snapshot, diff },
  };
}

function readJson(path) {
  const text = readTextIfExists(path);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readTextIfExists(path) {
  try {
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  } catch {
    return null;
  }
}

/**
 * 与历史基线的差异。ratchet 的意义全在这里：CI 只该拦「新增」，存量债务不阻断 ——
 * 否则第一次体检的几百条会让整个门禁被关掉。
 */
export function diffBaseline(previous, current) {
  const before = new Set(previous.components ?? []);
  const after = new Set(current.components ?? []);
  const riskDelta = {};
  for (const id of new Set([...Object.keys(previous.risks ?? {}), ...Object.keys(current.risks ?? {})])) {
    const delta = (current.risks?.[id] ?? 0) - (previous.risks?.[id] ?? 0);
    if (delta) riskDelta[id] = delta;
  }
  const regressed = Object.entries(riskDelta).filter(([, d]) => d > 0);
  return {
    componentsAdded: [...after].filter((s) => !before.has(s)),
    componentsDropped: [...before].filter((s) => !after.has(s)),
    highLevel: { from: previous.highLevelScore ?? null, to: current.highLevelScore },
    riskDelta,
    // ratchet：只有新增才算破线
    ratchetBroken: regressed.map(([id, d]) => `${id} 新增 ${d} 处`),
  };
}

// ----------------------------------------------------------------- 渲染 --

const MARK = { high: "●", medium: "◐", low: "○" };

export function renderAudit(a) {
  const lines = [`# 组件采用体检`, "", `- 项目：${a.projectRoot}（来源 ${a.projectRootSource}）`];

  const ui = a.context.ui;
  lines.push(
    `- 接入：${a.context.framework.name}${a.context.packageManager ? ` · ${a.context.packageManager}` : ""} · ` +
      `@hulianui/ui ${ui.installed ?? "未安装"}` +
      (ui.linkKind ? `（${ui.linkKind === "workspace" ? "workspace 包" : "本地源码"}）` : "") +
      (a.context.behind ? ` ⚠️ 落后于最新 ${a.context.latest}，建议先升级` : ""),
    `- 扫描：${a.scanned.files} 个代码文件，其中 ${a.scanned.usingHulian} 个用到瑚琏` +
      (a.scanned.truncated ? ` ⚠️ 达到 ${a.scanned.limit} 上限，**结果不完整**` : ""),
  );

  const s = a.scene.surface;
  lines.push(
    "",
    "## 场景判定",
    s
      ? `- surface：**${s.id}** ${MARK[s.confidence]} ${s.confidence}\n  - 依据：${s.evidence.join("；")}`
      : "- surface：**判不出** —— 没有任何组件 / 依赖 / 路由命中已知形态。项目可能刚起步，或属于 profile 尚未覆盖的形态；显式传 surface 可跳过判定",
  );
  // 次名如实报出：真实项目常横跨两种形态（admin 的壳 + 配置类的内容），
  // 只给一个答案是假装确定。判定依据可追溯 + 可人工覆盖，才是这个 tool 该给的东西。
  const alternatives = (a.scene.surfaceCandidates ?? []).filter((c) => c.id !== s?.id).slice(0, 2);
  if (alternatives.length && !a.scene.surface?.overridden) {
    lines.push(
      `  - 其它候选：${alternatives.map((c) => `${c.id}（${c.confidence}，${c.evidence[0]}）`).join(" · ")}` +
        `\n  - 判错了就显式传 surface 重跑，下面的机会点会跟着换一套`,
    );
  }
  for (const m of a.scene.modifiers) {
    lines.push(`- modifier：**${m.id}** ${MARK[m.confidence]} ${m.confidence} —— ${m.evidence.join("；")}`);
  }
  lines.push(
    a.scene.workflow === "prototype"
      ? "- workflow：**prototype** —— 已按原型口径评估：不推高层企业件，只保留「这个形态下缺了就是坏的」那类"
      : `- workflow：**${a.scene.workflow}**（正式实现口径）`,
  );
  if (a.scene.prototypeHint) {
    lines.push(
      `  - ⚠️ ${a.scene.prototypeHint} 里像是自述为原型 / demo。若属实请传 \`workflow="prototype"\` 重跑 —— ` +
        "原型求快、正式求规范是两种正当取向，拿正式系统的尺子量原型会得出一堆假缺口",
    );
  }

  const hl = a.usage.highLevel;
  lines.push(
    "",
    "## 采用情况",
    `- 高层业务组件采用度（主指标）：**${hl.score}** —— 已用 ${hl.used.join("、") || "无"}`,
    hl.missing.length ? `  - 未用：${hl.missing.join("、")}` : "",
    `- 组件 ${a.usage.components.length} 个 · 区块 ${a.usage.blocks.length} 个`,
    `- 类别分布：${Object.entries(a.usage.categories).map(([c, n]) => `${c} ${n}`).join(" · ") || "无"}`,
  );

  if (a.opportunities.length) {
    lines.push("", "## 机会点（有场景但没采用）");
    for (const o of a.opportunities.slice(0, 12)) {
      lines.push(`- ${MARK[o.confidence]} **${o.slug}** — ${o.reason}`);
    }
    if (a.opportunities.length > 12) lines.push(`- …另有 ${a.opportunities.length - 12} 条，见结构化输出`);
  } else {
    lines.push("", "## 机会点", "- 无。当前形态下该用的件都用上了（判据是同项目内的邻近信号，不是清单比对）");
  }

  if (a.risks.length) {
    const byId = new Map();
    for (const r of a.risks) {
      const key = `${r.id}:${r.confidence}`;
      byId.set(key, (byId.get(key) ?? 0) + 1);
    }
    lines.push("", "## 风险项（建议，非 error）");
    for (const [key, n] of byId) {
      const [id, confidence] = key.split(":");
      const sample = a.risks.find((r) => r.id === id && r.confidence === confidence);
      lines.push(
        `- ${MARK[confidence]} ${confidence} · **${id}** ${n} 处 → 建议 ${sample.should}` +
          `\n  - ${sample.why}` +
          `\n  - 例：${sample.file}:${sample.line}  \`${sample.snippet}\`` +
          (sample.basis.length ? `\n  - 判据：${sample.basis.join("；")}` : ""),
      );
    }
  }

  if (a.upstreamGaps.length) {
    lines.push("", "## 上游缺口候选（疑似组件能力不足导致的绕法）");
    for (const g of a.upstreamGaps.slice(0, 6)) {
      lines.push(`- ${g.file}:${g.line} — ${g.why}\n  \`${g.snippet}\``);
    }
  }

  if (a.plan.length) {
    lines.push("", "## 渐进迁移计划（按收益/风险排序）");
    for (const step of a.plan) {
      lines.push(
        `${step.order}. **${step.title}**（工作量 ${step.effort} · 风险 ${step.risk}）\n   - ${step.why}` +
          (step.targets.length ? `\n   - 涉及：${step.targets.join("、")}` : ""),
      );
    }
  }

  if (a.baseline.diff) {
    const d = a.baseline.diff;
    lines.push(
      "",
      "## 与基线的差异",
      `- 高层采用度：${d.highLevel.from} → ${d.highLevel.to}`,
      d.componentsAdded.length ? `- 新采用：${d.componentsAdded.join("、")}` : "",
      d.componentsDropped.length ? `- 不再使用：${d.componentsDropped.join("、")}` : "",
      d.ratchetBroken.length
        ? `- ⚠️ ratchet 破线（只该拦新增）：${d.ratchetBroken.join("；")}`
        : "- ratchet：没有新增违规",
    );
  }

  lines.push(
    "",
    "> 本报告全部是**带置信度的建议**，不是 error —— 可静态证明的错误归 validate_hulian_usage / @hulianui/guard。",
    "> `●` high / `◐` medium / `○` low。low 的多数是正当用法，别一律照改。",
    "> 机会点只报「同项目内有邻近信号」的缺口；没有该场景信号的低覆盖率不会出现在这里。",
  );

  return lines.filter((l) => l !== "").join("\n");
}
