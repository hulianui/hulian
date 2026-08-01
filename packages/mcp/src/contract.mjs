// Agent Contract：一份真源，生成到各家 Agent 客户端各自读取的指令文件里。
//
// 设计约束（来自 issue #41 的讨论）：
//   - 始终加载的部分必须短。复杂流程留给 MCP tool 按需取，不往这里堆。
//   - 只写「所有 UI 任务都适用」的规则。场景差异化的东西归 get_agent_profile，
//     否则营销页的特效配额会被套到中后台和长文页上。
//   - 用 marker 包住自己的区块，重复运行只更新这一段，绝不碰用户已有内容。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { listModifiers, listSurfaces, listWorkflows } from "./profiles.mjs";

export const MARKER_BEGIN = "<!-- hulianui:begin -->";
export const MARKER_END = "<!-- hulianui:end -->";

/**
 * 各家客户端实际读取的指令文件。顺序即写入优先级。
 * scope 说明这份文件是仓库级还是需要用户级安装 —— 不宣称跨客户端行为完全一致。
 */
export const TARGETS = [
  { id: "agents", file: "AGENTS.md", clients: ["Codex", "GitHub Copilot（agents 模式）"], scope: "repo" },
  { id: "claude", file: "CLAUDE.md", clients: ["Claude Code"], scope: "repo" },
  { id: "cursor", file: ".cursor/rules/hulianui.mdc", clients: ["Cursor"], scope: "repo" },
  { id: "copilot", file: ".github/copilot-instructions.md", clients: ["GitHub Copilot"], scope: "repo" },
];

/** Cursor 的 rules 文件需要 frontmatter 才会被自动加载。 */
function cursorFrontmatter() {
  return ["---", "description: 瑚琏 @hulianui/ui 使用契约", "alwaysApply: true", "---", ""].join("\n");
}

/**
 * 契约正文。刻意保持短 —— 长流程由 MCP tool 承载。
 * surface / modifier / workflow 的取值从 profile 真源读，避免两处漂移。
 */
export function buildContract({ uiVersion } = {}) {
  const surfaces = listSurfaces().map((s) => s.id).join(" / ");
  const modifiers = listModifiers().map((m) => m.id).join(" / ");
  const workflows = listWorkflows().map((w) => w.id).join(" / ");

  return `## 瑚琏 @hulianui/ui 使用契约

本项目的 UI 默认使用 \`@hulianui/ui\`${uiVersion ? `（当前实装 ${uiVersion}）` : ""}。以下六条适用于所有 UI 任务：

1. **先找现成的再拼**。开工前依次问：有没有整页 \`page-*\`、有没有区块 \`block-*\`、有没有
   高层业务组件；都没有才用低层原语拼。不要从 Card + Stack 手搭已有的 ProTable / FormDialog / PageHeader。
2. **不猜 props**。用到的每个组件在写第一行代码前查真实文档；查不到就说查不到，不要凭印象写。
3. **按场景选组件语言**，不要一套规则套所有页面。中后台不塞营销特效，正文阅读区不加干扰动效。
4. **缺能力回库补，不在本项目打补丁**。需要 \`style=\`、局部 CSS override 或行为 hack 才能用的地方，
   就是组件缺口 —— 回 HulianUI 修组件、补测试与文档，本项目升级后删掉临时绕法。
5. **用语义 token**，保留深浅色、响应式、可访问性与 \`prefers-reduced-motion\`。不硬编码颜色。
6. **完成后跑验证**，且这些证据不得互相冒充：guard 过 ≠ 类型过 ≠ 测试过 ≠ 页面真的对。

### 用 MCP 取上下文（已接入 \`hulianui\` server 时）

- \`inspect_project\` —— 认项目：框架、实装版本、Provider 与 token CSS 是否就位
- \`get_agent_profile\` —— 认场景：surface（${surfaces}）× modifiers（${modifiers}）× workflow（${workflows}）
- \`recommend_ui\` —— 一句需求换回 page → block → component 的排序候选
- \`get_component_doc\` —— **写代码前必查**，props 真源
- \`install_block\` —— 落盘区块 / 页面源码
- \`validate_hulian_usage\` —— 改完必跑

未接入 MCP 时，组件文档在 \`node_modules/@hulianui/ui/src/<slug>/<slug>.md\`。`;
}

/** 用 marker 包好的完整区块。 */
export function contractBlock(opts) {
  return `${MARKER_BEGIN}\n${buildContract(opts)}\n${MARKER_END}`;
}

/**
 * 计算对某个目标文件的改动，不落盘。
 * 三种结果：create（文件不存在）、update（已有我们的区块且内容变了）、
 * append（文件存在但没有我们的区块）、unchanged（已是最新）。
 */
export function planTarget(projectRoot, target, opts) {
  const path = join(projectRoot, target.file);
  const block = contractBlock(opts);
  const isCursor = target.id === "cursor";

  if (!existsSync(path)) {
    return {
      target,
      path,
      action: "create",
      next: isCursor ? `${cursorFrontmatter()}\n${block}\n` : `${block}\n`,
    };
  }

  const current = readFileSync(path, "utf8");
  const begin = current.indexOf(MARKER_BEGIN);
  const end = current.indexOf(MARKER_END);

  if (begin !== -1 && end !== -1 && end > begin) {
    const before = current.slice(0, begin);
    const after = current.slice(end + MARKER_END.length);
    const next = `${before}${block}${after}`;
    return { target, path, action: next === current ? "unchanged" : "update", next };
  }

  // marker 只出现一半 = 用户手工编辑坏了，不猜边界，交给人处理
  if (begin !== -1 || end !== -1) {
    return {
      target,
      path,
      action: "conflict",
      reason: `${target.file} 里只找到半个 hulianui marker（begin=${begin !== -1}, end=${end !== -1}）。` +
        `不猜区块边界，请手工修好成对的 marker 或整段删掉后重跑。`,
    };
  }

  const sep = current.endsWith("\n") ? "\n" : "\n\n";
  return { target, path, action: "append", next: `${current}${sep}${block}\n` };
}

/** 对所有（或指定的）目标算一遍计划。 */
export function planInit(projectRoot, { targets, onlyExisting = true, opts } = {}) {
  const chosen = targets?.length
    ? TARGETS.filter((t) => targets.includes(t.id))
    : TARGETS;

  return chosen
    .map((t) => planTarget(projectRoot, t, opts))
    .filter((p) => {
      // 默认只更新项目已有的指令文件，不主动往项目里撒四份新文件。
      // 一份都没有时由调用方决定写哪个（见 index.mjs 的兜底）。
      if (!onlyExisting) return true;
      return p.action !== "create";
    });
}

/** 落盘。返回实际发生的动作。 */
export function applyPlan(plans) {
  const done = [];
  for (const p of plans) {
    if (p.action === "unchanged" || p.action === "conflict") {
      done.push(p);
      continue;
    }
    mkdirSync(dirname(p.path), { recursive: true });
    writeFileSync(p.path, p.next);
    done.push(p);
  }
  return done;
}

/**
 * 体检：当前项目里契约装在哪、是不是最新、MCP 有没有配。
 * 只读。
 */
export function doctor(projectRoot, { opts } = {}) {
  const installed = [];
  const stale = [];
  const broken = [];
  const missing = [];

  for (const t of TARGETS) {
    const path = join(projectRoot, t.file);
    if (!existsSync(path)) {
      missing.push(t);
      continue;
    }
    const plan = planTarget(projectRoot, t, opts);
    if (plan.action === "unchanged") installed.push({ target: t, path });
    else if (plan.action === "conflict") broken.push({ target: t, path, reason: plan.reason });
    else if (plan.action === "update") stale.push({ target: t, path });
    else missing.push(t); // 文件在但没有契约区块
  }

  const mcpConfigs = [
    ".mcp.json",
    ".cursor/mcp.json",
    ".vscode/mcp.json",
    ".claude/settings.json",
  ].filter((f) => {
    const p = join(projectRoot, f);
    if (!existsSync(p)) return false;
    try {
      return readFileSync(p, "utf8").includes("hulianui");
    } catch {
      return false;
    }
  });

  return { projectRoot, installed, stale, broken, missing, mcpConfigs };
}

export function renderPlan(plans, projectRoot) {
  if (!plans.length) return "没有可更新的目标。";
  const verb = { create: "新建", update: "更新", append: "追加", unchanged: "已最新", conflict: "冲突" };
  return plans
    .map((p) => {
      const rel = relative(projectRoot, p.path) || p.target.file;
      const who = p.target.clients.join(" / ");
      if (p.action === "conflict") return `  ✗ ${rel}（${who}）— ${p.reason}`;
      return `  ${p.action === "unchanged" ? "·" : "→"} ${verb[p.action]} ${rel}（${who}）`;
    })
    .join("\n");
}
