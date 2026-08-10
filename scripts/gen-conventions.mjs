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
const OVERRIDE_OUT = process.env.HULIAN_REGISTRY_OUT;
const OUT_WWW = join(OVERRIDE_OUT || join(ROOT, "apps", "www", "public"), "conventions.json");
const OUT_GUARD = join(ROOT, "packages", "guard", "conventions.json");
const DOCS_LOCALE = process.env.DOCS_LOCALE === "en" ? "en" : "zh-CN";
const ENGLISH = DOCS_LOCALE === "en";

if (ENGLISH && !OVERRIDE_OUT) {
  throw new Error(
    "English conventions generation requires HULIAN_REGISTRY_OUT so tracked Chinese artifacts cannot be overwritten",
  );
}
const SEMANTIC_COLOR_NAMES = [
  ...new Set([
    // 兼容文档中沿用过的常见语义名；其余名称从 token 真源自动得出，避免新增 chart/ring
    // 等颜色后门禁继续漏报。
    "--background",
    "--info",
    "--secondary",
    ...[
      ...readFileSync(join(ROOT, "packages", "tokens", "src", "semantic.css"), "utf8").matchAll(
        /--color-([\w-]+)\s*:/g,
      ),
    ].map((match) => `--${match[1]}`),
  ]),
].sort();

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
    rule: '默认从根 barrel 导入：import { X } from "@hulianui/ui"；只用少数几个组件时，改子路径 import { Tag } from "@hulianui/ui/tag" 同样是官方入口',
    why: "本库是源码分发，根 barrel 会把整棵 src/ 与全部 dependencies 拖进消费方的 dev 模块图（#19 / #34 实测：Next 冷编译 16.5s → 3.9s、模块数 7378 → 1730）。根入口还是子路径由消费项目的规模与打包器决定，不是全库通用门禁",
    instead:
      "两种入口导出同一份东西、可以混用。Next 消费方也可以留在根 barrel，加 experimental.optimizePackageImports 让编译期自动改写。真正禁止的只有 exports 之外的路径（_icons、src/...、已移除的 date-pickers），那条由 guard 的 no-private-deep-import 拦",
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
  {
    id: "muted-is-text-only",
    rule: "次要文字色叫 --color-muted-foreground（text-muted-foreground）；--color-muted 是弱背景，与 shadcn 一致",
    wrong: 'className="text-muted"',
    right: 'className="text-muted-foreground"',
    why: "0.28.0 之前瑚琏的 --color-muted 是次要**文字**色，与 shadcn 生态同名反义（那边 --muted 是背景、--muted-foreground 才是文字）。同名反义的代价是双向的：shadcn 项目一引入瑚琏 token，全站 bg-muted 立刻变深灰底；而库自己的贡献者又反复按 shadcn 肌肉记忆写 text-muted-foreground。0.28.0 起统一朝生态靠，text-muted 不再有对应 token —— Tailwind 对未定义颜色不报错也不生成规则，写了会静默回退成继承色",
    instead:
      "text-muted → text-muted-foreground；bg-muted 现在就是弱背景（等价 bg-subtle），可以放心用",
  },
  {
    id: "select-none-for-non-copyable",
    rule: "设计上会被连点、会自动移动、或可拖拽的元素，其文本一律 select-none",
    why: "浏览器把连续点击识别成双击选词 / 三击选段；自动滚动与拖拽中的元素还会让选区跨元素蔓延。这三类的文字都是控件标签或装饰，不是给用户复制的",
    instead:
      "Button / Kanban 卡片 / DesignCanvas / 弹幕 / 礼物飘条已内置；自搓触发器与飘动层记得补。真正需要复制的内容（聊天正文、代码块）保持可选",
  },
];

const GLOBAL_EN = [
  {
    id: "no-style-override",
    rule: "Do not override Hulian UI component styles with the style prop or local CSS in product code.",
    why: "Overrides bypass semantic OKLCH tokens, break theme switching, and create upgrade conflicts.",
    instead:
      "Add the missing prop or variant to the library component and consume semantic tokens.",
  },
  {
    id: "import-from-root-barrel",
    rule: 'Import from the root barrel by default: import { X } from "@hulianui/ui". For a small component set, the matching @hulianui/ui/<slug> subpath is also public.',
    why: "The library ships source. Root imports can expand a consumer's development module graph, while public subpaths and optimizePackageImports reduce that cost.",
    instead:
      "Use either documented public entry. Never import private _icons, src paths, or the removed date-pickers entry.",
  },
  {
    id: "color-token-prefix",
    rule: "CSS variables passed to SVG fill or stroke and inline styles must use the --color- prefix.",
    wrong: 'fill="var(--primary)"',
    right: 'fill="var(--color-primary)"',
    why: "Tailwind CSS v4 theme variables use the --color- prefix. Bare semantic names do not resolve.",
  },
  {
    id: "theme-provider",
    rule: "Wrap the application root with ThemeProvider and inject the anti-flash inline script at the entry point.",
    why: "Semantic tokens depend on data-theme. Without the provider theme switching fails, and without the script the first rendered frame can flash the wrong theme.",
  },
  {
    id: "toast-signature",
    rule: "toast accepts one object argument: toast({ title, description?, tone?, timeout? }). It has no toast.success() shortcuts.",
    wrong: 'toast.success("Saved")',
    right: 'toast({ title: "Saved", tone: "success" })',
    why: 'tone accepts "neutral", "info", "success", "warning", or "danger" and defaults to "neutral".',
  },
  {
    id: "admin-layout-fitviewport",
    rule: "Keep AdminLayout fitViewport at its default true for a full page. Set it to false when embedding the layout in a fixed-height container.",
    why: "The component already owns 100dvh. An additional viewport-height wrapper moves scrolling to the whole page instead of the content area.",
  },
  {
    id: "fix-component-not-patch",
    rule: "If a workflow needs a CSS override or behavior hack, treat it as a component gap and fix the library component.",
    why: "Call-site patches duplicate the same gap across pages and make behavior inconsistent.",
  },
  {
    id: "muted-is-text-only",
    rule: "Secondary text is --color-muted-foreground (text-muted-foreground); --color-muted is a weak background, matching shadcn/ui.",
    wrong: 'className="text-muted"',
    right: 'className="text-muted-foreground"',
    why: "Before 0.28.0 Hulian defined --color-muted as the secondary *text* colour, the exact opposite of the shadcn/ui vocabulary where --muted is a background and --muted-foreground is the text colour. The cost ran both ways: a shadcn project that imported Hulian tokens saw every bg-muted turn into a dark grey slab, while Hulian's own contributors kept reaching for text-muted-foreground out of habit. 0.28.0 aligns with the ecosystem, so text-muted no longer maps to a token — Tailwind neither errors nor emits a rule for an undefined colour, so it silently falls back to the inherited colour.",
    instead:
      "Rewrite text-muted as text-muted-foreground. bg-muted is now a genuine weak background (identical to bg-subtle) and is safe to use.",
  },
  {
    id: "select-none-for-non-copyable",
    rule: "Any element designed to be clicked repeatedly, to move on its own, or to be dragged must have select-none on its text.",
    why: "Browsers turn rapid clicks into word or line selection, and selections spread across elements while something is being dragged. Text in all three cases is a control label or decoration, not content to copy.",
    instead:
      "Button, Kanban cards, DesignCanvas, Danmaku, and GiftFeed already handle this. Add it to hand-rolled triggers and floating layers. Keep genuinely copyable content such as chat messages and code blocks selectable.",
  },
];

/**
 * 公开子路径全集 —— 真源是 `packages/ui/package.json` 的 exports 加真实目录，不是人工清单。
 *
 * `./*` 映射到 `./src/<slug>/index.ts`，所以「有 index.ts 的目录」就是它能解析出的全部条目；
 * `./showcase` / `./vite` / `./vitest-preset` 这类显式条目单独列在 exports 里。二者之外的
 * 任何子路径（`_icons`、`src/...`、以及 0.15.0 移除的 `date-pickers`）才是真正导不进去的。
 */
function publicSubpaths() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "packages", "ui", "package.json"), "utf8"));
  const explicit = Object.keys(pkg.exports)
    .filter((k) => k.startsWith("./") && k !== "./*")
    .map((k) => k.slice(2));
  const wildcard = readdirSync(UI_SRC).filter((d) => existsSync(join(UI_SRC, d, "index.ts")));
  return [...new Set([...explicit, ...wildcard])].sort();
}

const PUBLIC_SUBPATHS = publicSubpaths();

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
    // 只禁**真正解析不出来**的子路径。曾经这条是 `^@hulianui/ui/`，把所有子路径一律判 error，
    // 于是 `@hulianui/ui/button`（consuming.md §3 明确推荐，用来避免源码分发下根 barrel 撑大
    // dev 模块图）和库自己的 `vitest-preset` / `vite` 官方集成入口都成了违规 —— 门禁跟文档、
    // 跟 package.json exports 三方打架。见 hulianui/hulian#36。
    //
    // 现在用负向前瞻放行 exports 能解析的全部条目，剩下的（`_icons`、`src/...`、已移除的
    // `date-pickers`）才报错，且列表随目录自动更新，不需要人工维护。
    id: "no-private-deep-import",
    severity: "error",
    matcher: {
      kind: "forbidden-import",
      sourcePattern: `^@hulianui/ui/(?!(?:${PUBLIC_SUBPATHS.map((s) =>
        s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      ).join("|")})$)`,
    },
    message: "这个子路径不在 @hulianui/ui 的 package.json exports 里，导入会解析失败。",
    instead:
      "改用根入口 @hulianui/ui，或改成 exports 里真实存在的子路径（如 @hulianui/ui/button）。",
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
    // 同一段 className 里 bg-muted-foreground 与 text-muted-foreground 同时出现 = 前景背景同色：亮色下 gray-600 字
    // 压 gray-600 底、暗色下 gray-400 字压 gray-400 底，两个主题都不可读，而 typecheck /
    // 单测 / 现有 guard 全都看不见（类名合法、颜色也生成）。见 #128。
    //
    // 两侧都用 (?<![\w:-]) 排掉带变体前缀的写法（hover:bg-muted-foreground、
    // [&::-webkit-scrollbar-thumb]:bg-muted-foreground）—— 变体意味着「另一个状态或另一个伪元素」，
    // 与静息态的文字色不在同一个盒子上。不排的话 Chart 图例（文字 text-muted-foreground + 滚动条拇指
    // bg-muted-foreground/50）会被误判，而它是对的。只判静息态才是真正零误报的那条线。
    id: "muted-as-background-with-muted-text",
    severity: "error",
    matcher: {
      kind: "class-name-tokens",
      attributes: ["className"],
      pattern: "(?<![\\w:-])bg-muted-foreground(?:/[\\d.[\\]]+)?\\b",
      coOccurs: "(?<![\\w:-])text-muted-foreground(?:/[\\d.[\\]]+)?\\b",
    },
    message: "bg-muted-foreground 与 text-muted-foreground 同时出现：--color-muted-foreground 是次要文字色，前景背景同色不可读。",
    instead: "背景改用 bg-subtle（静态弱背景）或 bg-surface-hover（悬停态），文字保持 text-muted-foreground。",
  },
  {
    // 0.28.0 语义反转（#142）的迁移门禁：次要文字色从 --color-muted 改名成
    // --color-muted-foreground，`text-muted` 之类**不再对应任何 token**。
    // 这必须是 error 而不是 warning：Tailwind 遇到未定义颜色既不报错也不生成规则，
    // 于是 text-muted 静默回退成继承色 —— 「次要说明文字」渲染成与正文同色，
    // typecheck / 单测 / 视觉快照全都看不出来，只能靠这条拦。
    //
    // 刻意**不含** bg-muted：反转后它就是弱背景（等价 bg-subtle），是合法写法。
    id: "muted-renamed-to-muted-foreground",
    severity: "error",
    matcher: {
      kind: "class-name-tokens",
      attributes: ["className"],
      pattern:
        "(?<![\\w-])(?:text|fill|stroke|border|decoration|placeholder|caret|divide|outline|accent|ring|from|to|via|shadow)-muted(?![\\w-])",
    },
    message:
      "text-muted 等写法在 0.28.0 已改名：次要文字色现在叫 --color-muted-foreground，--color-muted 变成了弱背景（对齐 shadcn）。",
    instead:
      "把 `-muted` 改成 `-muted-foreground`（text-muted → text-muted-foreground）。bg-muted 不用改，它现在就是弱背景。",
  },
  {
    id: "color-token-prefix",
    severity: "error",
    matcher: {
      kind: "css-var-prefix",
      attributes: ["fill", "stroke", "style"],
      requiredPrefix: "--color-",
      semanticNames: SEMANTIC_COLOR_NAMES,
    },
    message: "SVG 或内联 style 中的颜色变量必须使用 --color- 前缀。",
    instead: "例如 var(--color-primary)。",
  },
];

const EXECUTABLE_COPY_EN = {
  "no-style-override": {
    message: "Do not use style to override Hulian UI component styling in product code.",
    instead: "Add a component prop or variant and use semantic tokens.",
  },
  "no-private-deep-import": {
    message: "This subpath is not exported by @hulianui/ui and cannot be resolved.",
    instead: "Use @hulianui/ui or a real public subpath such as @hulianui/ui/button.",
  },
  "toast-object-signature": {
    message: "toast has no success, error, or other member-call shortcuts.",
    instead: 'Use toast({ title: "Saved", tone: "success" }).',
  },
  "muted-as-background-with-muted-text": {
    message:
      "bg-muted-foreground and text-muted-foreground appear together: --color-muted-foreground is the secondary text colour, so foreground and background end up identical and unreadable.",
    instead:
      "Use bg-subtle for a static background or bg-surface-hover for a hover state, and keep text-muted-foreground for the text.",
  },
  "muted-renamed-to-muted-foreground": {
    message:
      "text-muted and friends were renamed in 0.28.0: the secondary text colour is now --color-muted-foreground, and --color-muted became a weak background, matching shadcn/ui.",
    instead:
      "Rewrite `-muted` as `-muted-foreground` (text-muted becomes text-muted-foreground). Leave bg-muted alone — it is a genuine weak background now.",
  },
  "color-token-prefix": {
    message: "Color variables in SVG attributes and inline styles must use the --color- prefix.",
    instead: "For example, use var(--color-primary).",
  },
};

// ------------------------------------------------------- 易混淆的兄弟件 --
// 选错不会报错，只是不对 —— 这类恰恰是 AI 最容易栽的。取值均已核对源码。

const CONFUSABLES = [
  {
    when: "单个日期选择（输入框 + 弹层日历）",
    pick: "DatePicker",
    notThis: "DateField",
    why: 'DateField 是 0.15.0 之前的名字，已改名为 DatePicker（picker="date|month|year" 三粒度）；要不带浮层的常驻面板用 Calendar',
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
    why: "HeadingSize 取值是 xs | sm | base | lg | xl | 2xl | 3xl | 4xl，没有 md 这一档",
  },
];

const CONFUSABLES_EN = [
  {
    when: "Selecting one date with an input and popup calendar",
    pick: "DatePicker",
    notThis: "DateField",
    why: "DateField was renamed before version 0.15.0. DatePicker supports date, month, and year precision; use Calendar for an always-visible panel.",
  },
  {
    when: "Showing a text label with semantic status color",
    pick: "Tag",
    notThis: "Badge",
    why: "Badge is a count or dot indicator. Tag provides variant and tone for labeled status.",
  },
  {
    when: "Separating content with a text label",
    pick: "Divider",
    notThis: "Separator",
    why: "Separator is a geometric role=separator primitive. Divider supports text, alignment, and dashed styling.",
  },
  {
    when: "Representing a deployment or build lifecycle",
    pick: "DeployStatus",
    notThis: "StatusDot",
    why: "StatusDot represents health or availability. DeployStatus models six deployment states and animates the building state.",
  },
  {
    when: "Choosing a Heading size",
    pick: 'Heading size "base"',
    notThis: 'size="md"',
    why: "HeadingSize accepts xs, sm, base, lg, xl, 2xl, 3xl, or 4xl; md is not a valid value.",
  },
];

// -------------------------------------------------- 组件级约束（自动提取）--

/** 取当前语言的约束章节到下一个二级标题或真实 EOF 之间的正文。 */
export function extractPitfalls(md, locale = DOCS_LOCALE) {
  const heading =
    locale === "en"
      ? /^##\s*(?:Usage guidelines|Usage notes|Usage|Pitfalls)\s*$/im
      : /^##\s*禁忌\s*\/\s*坑\s*$/m;
  const headingMatch = heading.exec(md);
  if (!headingMatch) return [];
  const tail = md.slice(headingMatch.index + headingMatch[0].length);
  const nextHeading = /^##\s/m.exec(tail);
  const body = tail.slice(0, nextHeading?.index ?? tail.length).trim();
  if (!body || (locale !== "en" && /^暂无/.test(body))) return [];

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
    .filter((s) => s && (locale === "en" || !/^暂无/.test(s)))
    .map((s) => ({ rule: s.replace(/\[\[([\w-]+)\]\]/g, "$1").replace(/\s+/g, " ") }));
}

function normalizeEnglishDistribution(source) {
  return source
    .replaceAll("｜", "|")
    .replace(
      /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/gu,
      (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`,
    );
}

export function buildConventions(locale = DOCS_LOCALE) {
  const slugs = readdirSync(UI_SRC).filter((d) => existsSync(join(UI_SRC, d, `${d}.md`)));
  const globalRules = locale === "en" ? GLOBAL_EN : GLOBAL;
  const executableRules =
    locale === "en"
      ? EXECUTABLE_RULES.map((rule) => ({ ...rule, ...EXECUTABLE_COPY_EN[rule.id] }))
      : EXECUTABLE_RULES;
  const confusables = locale === "en" ? CONFUSABLES_EN : CONFUSABLES;
  const advisories = globalRules.map((rule) => ({
    ...rule,
    id: `global/${rule.id}`,
    scope: "global",
    source: "scripts/gen-conventions.mjs",
  }));
  let ruleCount = 0;

  for (const slug of slugs.sort()) {
    const file = join(UI_SRC, slug, `${slug}${locale === "en" ? ".en" : ""}.md`);
    if (!existsSync(file)) throw new Error(`Missing ${locale} conventions source: ${file}`);
    const raw = readFileSync(file, "utf8");
    const md = locale === "en" ? normalizeEnglishDistribution(raw) : raw;
    const rules = extractPitfalls(md, locale);
    if (!rules.length) continue;
    const title = (md.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || slug;
    rules.forEach((rule, index) => {
      advisories.push({
        id: `component/${slug}/pitfall/${index + 1}`,
        scope: slug,
        title,
        rule: rule.rule,
        source: `packages/ui/src/${slug}/${slug}${locale === "en" ? ".en" : ""}.md`,
      });
    });
    ruleCount += rules.length;
  }

  return {
    version: "2",
    description:
      locale === "en"
        ? "Hulian UI usage constraints. @hulianui/guard can execute executableRules; advisories require product context and are not presented as hard gates."
        : "瑚琏使用约束。executableRules 可由 @hulianui/guard 执行；advisories 是需结合业务判断的建议，不冒充硬门禁。",
    generatedBy: "scripts/gen-conventions.mjs",
    executableRules,
    advisories,
    confusables: confusables.map((item, index) => ({ id: `confusable/${index + 1}`, ...item })),
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
    if (OVERRIDE_OUT || ENGLISH) {
      throw new Error("conventions --check only validates canonical Chinese package artifacts");
    }
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

  const wwwDir = dirname(OUT_WWW);
  if (!existsSync(wwwDir)) mkdirSync(wwwDir, { recursive: true });
  writeFileSync(OUT_WWW, json);
  if (!OVERRIDE_OUT) {
    writeFileSync(OUT_PKG, json);
    if (existsSync(dirname(OUT_GUARD))) writeFileSync(OUT_GUARD, json);
  }

  console.log(
    `[conventions] executable(${out.executableRules.length}) · advisories(${out.advisories.length}) · ` +
      `confusables(${out.confusables.length}) · component docs(${out.stats.componentDocs})`,
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
