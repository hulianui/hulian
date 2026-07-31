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
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages", "ui", "src");
const OUT_PKG = join(ROOT, "packages", "ui", "conventions.json");
const OUT_WWW = join(ROOT, "apps", "www", "public", "conventions.json");

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
    rule: '统一从根 barrel 导入：import { X } from "@hulianui/ui"。唯一例外是日期族（Calendar / DatePicker / DateTimePicker / TimeField / MuiBridgeProvider），它们走 "@hulianui/ui/date-pickers"',
    why: "深路径导入绕过 barrel 的类型聚合与副作用声明，升级时路径也易变。日期族之所以例外，是因为它依赖 optional peer（MUI/emotion），留在根 barrel 就会强制每个消费方装齐才能 import 任何组件",
    wrong: 'import { DatePicker } from "@hulianui/ui"',
    right: 'import { DatePicker } from "@hulianui/ui/date-pickers"',
  },
  {
    id: "color-token-prefix",
    rule: "喂给 SVG fill/stroke 或内联 style 的颜色变量必须带 --color- 前缀",
    wrong: 'fill="var(--primary)"',
    right: 'fill="var(--color-primary)"',
    why: "Tailwind v4 的 @theme 生成的真名带 --color- 前缀；裸名不解析，表现为 fill 变黑、stroke 消失（工具类如 text-primary 不受影响）",
  },
  {
    id: "mui-bridge-provider",
    rule: "日期族（Calendar / DatePicker / DateTimePicker / TimeField）必须置于 MuiBridgeProvider 之内",
    why: "桥接层把 emotion theme 接到瑚琏 CSS 变量；缺 Provider 时真实浏览器里会抛 Unsupported color。注意 Rating / Stepper 已自研为零依赖，不再需要这层包裹",
    instead: "在用到这些组件的子树外层包一层 <MuiBridgeProvider>",
  },
  {
    id: "mui-optional-peer",
    rule: '要用日期族就必须自行安装 optional peer：@mui/material @mui/x-date-pickers @emotion/react @emotion/styled，并从 "@hulianui/ui/date-pickers" 子路径导入',
    why: "这四个包已从 dependencies 降为 optional peerDependencies，日期族也一并移出根 barrel —— 不用日期族的项目不该被迫装下整个 MUI 与 emotion（runtime CSS-in-JS，不兼容 RSC）。emotion 那两个包组件源码里看不到，它是 MUI 的样式引擎，少装同样跑不起来",
    instead: "不用日期族就什么都不用装；用的话 pnpm add 上面四个包，再走子路径导入",
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

// ------------------------------------------------------- 易混淆的兄弟件 --
// 选错不会报错，只是不对 —— 这类恰恰是 AI 最容易栽的。取值均已核对源码。

const CONFUSABLES = [
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

function main() {
  const slugs = readdirSync(UI_SRC).filter((d) => existsSync(join(UI_SRC, d, `${d}.md`)));
  const components = {};
  let ruleCount = 0;

  for (const slug of slugs.sort()) {
    const md = readFileSync(join(UI_SRC, slug, `${slug}.md`), "utf8");
    const rules = extractPitfalls(md);
    if (!rules.length) continue;
    const title = (md.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || slug;
    components[slug] = { title, rules };
    ruleCount += rules.length;
  }

  const out = {
    version: "1",
    description:
      "瑚琏使用约束。global/confusables 手写并核对过源码；components 从各组件 md 的「禁忌 / 坑」章节自动提取。",
    generatedBy: "scripts/gen-conventions.mjs",
    global: GLOBAL,
    confusables: CONFUSABLES,
    components,
  };

  const json = JSON.stringify(out, null, 2);
  writeFileSync(OUT_PKG, json);
  const wwwDir = dirname(OUT_WWW);
  if (!existsSync(wwwDir)) mkdirSync(wwwDir, { recursive: true });
  writeFileSync(OUT_WWW, json);

  console.log(
    `[conventions] global(${GLOBAL.length}) · confusables(${CONFUSABLES.length}) · ` +
      `components(${Object.keys(components).length}/${slugs.length} 有实质约束，共 ${ruleCount} 条)`,
  );
}

main();
