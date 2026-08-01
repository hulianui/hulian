#!/usr/bin/env node
// gen-conventions.mjs — 把「瑚琏怎么用才对」从散文变成机器可读的约束。
//
// 为什么需要它：约束其实一直存在，只是散落在三个地方 ——
//   · 360 个组件 md 里的「禁忌 / 坑」章节（写得很好，但 AI 要整吞 1.1M 才看得到）
//   · docs/consuming.md 里的接入硬约束
//   · 一堆 skill / memory 里的实测教训
// AI 读不到就会违反，而这些约束多数**运行时才报错，或者根本不报错只是变丑**。
//
// 产物 conventions.json 由 @hulianui/mcp 的 get_conventions tool 消费，
// 让 AI 在**写代码时**就拿到，而不是事后 review 才发现。
//
// 全局约束与易混淆件是手写的（需要判断），组件级约束从 md 自动提取（不会漂移）。
// 零依赖。Run: node scripts/gen-conventions.mjs

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const OUT_PKG = join(ROOT, "packages", "ui", "conventions.json");
const OUT_WWW = join(ROOT, "apps", "www", "public", "conventions.json");
const OUT_GUARD = join(ROOT, "packages", "guard", "conventions.json");

// ------------------------------------------------------------ 全局硬约束 --
// 每一条都在源码里核对过取值，不是凭印象写的 —— 写错的约束比没有约束更糟。

const GLOBAL = [
  {
    id: "no-style-override",
    rule: "业务代码里禁止用 style= 或局部 CSS 覆盖组件样式",
    why: "覆盖会绕过 OKLCH 语义 token，明暗切换与运行时换肤当场失效；而且下次升级组件必然冲突",
    instead: "组件缺能力就回库改组件（加 prop / 加 variant），不要在调用处打补丁",
  },
  {
    id: "import-from-root-barrel",
    rule: '统一从根 barrel 导入：import { X } from "@hulianui/ui"。**没有例外入口** —— 0.15.0 起日期族也在根 barrel 里',
    why: "深路径导入绕过 barrel 的类型聚合与副作用声明，升级时路径也易变。曾经存在的 @hulianui/ui/date-pickers 子路径已随日期族自研零依赖一并移除",
  },
  {
    id: "color-token-prefix",
    rule: "喂给 SVG fill/stroke 或内联 style 的颜色变量必须带 --color- 前缀",
    wrong: 'fill="var(--primary)"',
    right: 'fill="var(--color-primary)"',
    why: "Tailwind v4 的 @theme 生成的真名带 --color- 前缀；裸名不解析，表现为 fill 变黑、stroke 消失（工具类如 text-primary 不受影响）",
  },
  {
    id: "theme-provider",
    rule: "应用根部必须包 ThemeProvider，并在入口注入防白闪 inline script",
    why: "语义 token 挂在 [data-theme] 上：缺 Provider 则明暗切换无效，缺 inline script 则 SSR 首屏白闪",
  },
  {
    id: "toast-signature",
    rule: "toast 只有一个对象签名 toast({ title, description?, tone?, timeout? })，没有 toast.success() 这类快捷方法",
    wrong: 'toast.success("已保存")',
    right: 'toast({ title: "已保存", tone: "success" })',
    why: 'tone 取值为 "neutral" | "info" | "success" | "warning" | "danger"（默认 neutral）',
  },
  {
    id: "admin-layout-fitviewport",
    rule: "整页用 AdminLayout 时保持 fitViewport 默认 true，不要再在外面套 h-dvh wrapper；嵌进固定高度容器时必须显式传 false",
    why: "组件自钉 100dvh；外面再套一层会导致整页滚动而不是内容区滚动",
  },
  {
    id: "fix-component-not-patch",
    rule: "写业务时发现需要 CSS override 或行为 hack 才好用 —— 那是组件的缺口，回库补组件",
    why: "在调用处打补丁会让同一个缺口在每个页面各修一遍，且都修得不一样",
  },
];

// 这里只放能用 AST 低误报判断的规则。其余经验即使很重要，也只能进入 advisories，
// 不能把自然语言包装成一个看似可执行、实际无法可靠执行的“门禁”。
const EXECUTABLE_RULES = [
  {
    id: "no-style-override",
    severity: "error",
    matcher: {
      kind: "forbidden-jsx-prop",
      imports: ["@hulianui/ui"],
      prop: "style",
    },
    message: "业务代码不要用 style 覆盖瑚琏组件样式。",
    instead: "为组件补 prop 或 variant，并使用语义 token。",
  },
  {
    id: "no-private-deep-import",
    severity: "error",
    matcher: {
      kind: "forbidden-import",
      sourcePattern: "^@hulianui/ui/",
    },
    message: "不要导入 @hulianui/ui 的私有深路径。",
    instead: "统一从 @hulianui/ui 根入口导入。",
  },
  {
    id: "toast-object-signature",
    severity: "error",
    matcher: {
      kind: "forbidden-call",
      source: "@hulianui/ui",
      importedName: "toast",
      memberCall: true,
    },
    message: "toast 没有 success/error 等成员快捷方法。",
    instead: '使用 toast({ title: "已保存", tone: "success" })。',
  },
  {
    id: "color-token-prefix",
    severity: "error",
    matcher: {
      kind: "css-var-prefix",
      attributes: ["fill", "stroke", "style"],
      requiredPrefix: "--color-",
      semanticNames: [
        "--background",
        "--danger",
        "--foreground",
        "--info",
        "--muted",
        "--primary",
        "--secondary",
        "--success",
        "--surface",
        "--warning",
      ],
    },
    message: "SVG 或内联 style 中的颜色变量必须使用 --color- 前缀。",
    instead: "例如 var(--color-primary)。",
  },
];

// ------------------------------------------------------- 易混淆的兄弟件 --
// 选错不会报错，只是不对 —— 这类恰恰是 AI 最容易栽的。取值均已核对源码。

const CONFUSABLES = [
  {
    when: "单个日期选择（输入框 + 弹层日历）",
    pick: "DatePicker",
    notThis: "DateField",
    why: "DateField 是 0.15.0 之前的名字，已改名为 DatePicker（picker=\"date|month|year\" 三粒度）；要不带浮层的常驻面板用 Calendar",
  },
  {
    when: "需要带状态色的文字标签",
    pick: "Tag",
    notThis: "Badge",
    why: "Badge 是计数/圆点角标（props 为 count/dot/content/max/showZero），没有 variant；Tag 才有 variant + tone",
  },
  {
    when: "需要带文字的分隔线",
    pick: "Divider",
    notThis: "Separator",
    why: "Separator 是纯几何分隔线（role=separator），不带文字槽；Divider 支持左/中/右文字与 dashed",
  },
  {
    when: "表示部署/构建的生命周期状态",
    pick: "DeployStatus",
    notThis: "StatusDot",
    why: "StatusDot 表示健康态（在线/离线/异常）；DeployStatus 是部署六态，building 会转圈",
  },
  {
    when: "标题分级",
    pick: 'Heading size 用 "base"',
    notThis: 'size="md"',
    why: 'HeadingSize 取值是 xs | sm | base | lg | xl | 2xl | 3xl | 4xl，没有 md 这一档',
  },
];

// -------------------------------------------------- 组件级约束（自动提取）--

/** 取 md 里 `## 禁忌 / 坑` 到下一个 `## ` 之间的正文。 */
function extractPitfalls(md) {
  const m = md.match(/^##\s*禁忌\s*\/\s*坑\s*$([\s\S]*?)(?=^##\s|\Z)/m);
  if (!m) return [];
  const body = m[1].trim();
  if (!body || /^暂无/.test(body)) return [];

  // 按 markdown 列表项切分；条目可能跨多行
  const items = [];
  let cur = null;
  for (const line of body.split("\n")) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (cur) items.push(cur.trim());
      cur = line.replace(/^\s*[-*]\s+/, "");
    } else if (cur !== null && line.trim()) {
      cur += ` ${line.trim()}`;
    }
  }
  if (cur) items.push(cur.trim());

  // 没有列表结构时，整段作为一条
  if (!items.length) return [{ rule: body.replace(/\s+/g, " ").slice(0, 600) }];

  return items
    .filter((s) => s && !/^暂无/.test(s))
    .map((s) => ({ rule: s.replace(/\[\[([\w-]+)\]\]/g, "$1").replace(/\s+/g, " ") }));
}

export function buildConventions() {
  const slugs = readdirSync(UI_SRC).filter((d) => existsSync(join(UI_SRC, d, `${d}.md`)));
  const advisories = GLOBAL.map((rule) => ({
    ...rule,
    id: `global/${rule.id}`,
    scope: "global",
    source: "scripts/gen-conventions.mjs",
  }));
  let ruleCount = 0;

  for (const slug of slugs.sort()) {
    const md = readFileSync(join(UI_SRC, slug, `${slug}.md`), "utf8");
    const rules = extractPitfalls(md);
    if (!rules.length) continue;
    const title = (md.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || slug;
    rules.forEach((rule, index) => {
      advisories.push({
        id: `component/${slug}/pitfall/${index + 1}`,
        scope: slug,
        title,
        rule: rule.rule,
        source: `packages/ui/src/${slug}/${slug}.md`,
      });
    });
    ruleCount += rules.length;
  }

  return {
    version: "2",
    description:
      "瑚琏使用约束。executableRules 可由 @hulianui/guard 执行；advisories 是需结合业务判断的建议，不冒充硬门禁。",
    generatedBy: "scripts/gen-conventions.mjs",
    executableRules: EXECUTABLE_RULES,
    advisories,
    confusables: CONFUSABLES.map((item, index) => ({ id: `confusable/${index + 1}`, ...item })),
    stats: {
      componentDocs: slugs.length,
      componentAdvisories: ruleCount,
      totalAdvisories: advisories.length,
    },
  };
}

function main() {
  const out = buildConventions();
  const json = `${JSON.stringify(out, null, 2)}\n`;

  if (process.argv.includes("--check")) {
    const current = existsSync(OUT_PKG) ? readFileSync(OUT_PKG, "utf8") : "";
    const guardCurrent = existsSync(OUT_GUARD) ? readFileSync(OUT_GUARD, "utf8") : "";
    if (current !== json || (existsSync(dirname(OUT_GUARD)) && guardCurrent !== json)) {
      console.error("[conventions] conventions.json 已漂移，请运行 pnpm conventions");
      process.exitCode = 1;
      return;
    }
    console.log(
      `[conventions] check PASS · executable(${out.executableRules.length}) · advisories(${out.advisories.length})`,
    );
    return;
  }

  writeFileSync(OUT_PKG, json);
  if (existsSync(dirname(OUT_GUARD))) writeFileSync(OUT_GUARD, json);
  const wwwDir = dirname(OUT_WWW);
  if (!existsSync(wwwDir)) mkdirSync(wwwDir, { recursive: true });
  writeFileSync(OUT_WWW, json);

  console.log(
    `[conventions] executable(${out.executableRules.length}) · advisories(${out.advisories.length}) · ` +
      `confusables(${out.confusables.length}) · component docs(${out.stats.componentDocs})`,
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
