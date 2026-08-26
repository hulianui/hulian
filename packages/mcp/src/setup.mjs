// 消费方接入指南。
//
// 这些约束一直存在（docs/consuming.md + README 快速开始），但只活在人读的文档里：
// MCP 的四个 tool 一个都答不了「tokens CSS 怎么引」「Next 要加哪行配置」「Vitest 为什么
// 解析出两份 React」。于是每个会话都要重新 grep 一遍消费方仓库来倒推接入方式。
//
// 这里按 target 切片下发，每片都指回真源章节，避免和 consuming.md 各说各话。

const DOC = "https://github.com/hulianui/hulian/blob/master/docs/consuming.md";

export const SETUP_TARGETS = ["install", "locale", "next", "vite", "vitest", "imports", "tailwind"];

const SECTIONS = {
  install: {
    title: "安装与最小可跑",
    body: `\`\`\`bash
pnpm add @hulianui/ui @hulianui/tokens
# peer 必须自己装：react · react-dom · tailwindcss · @base-ui/react · motion
\`\`\`

\`@base-ui/react\` 是 peerDependency，**必须出现在消费方 package.json 里** —— 否则不是「有两份」
而是压根找不到，dedupe 也无从谈起。

应用根上挂两个 Provider：

\`\`\`tsx
import { ThemeProvider, ConfigProvider, enUS, Button } from "@hulianui/ui"

export default function App() {
  return (
    <ThemeProvider>
      {/* 界面语言不是中文时，ConfigProvider 是必需品而不是可选项 —— 见 target=locale */}
      <ConfigProvider locale={enUS}>
        <Button>开始</Button>
      </ConfigProvider>
    </ThemeProvider>
  )
}
\`\`\`

没有必须挂的第三方 Provider（0.15.0 起 MUI 已彻底出库）。中文应用可以省掉 \`ConfigProvider\`
（内置文案本来就是 zh-CN）；**其它任何语言都不能省**，理由见 \`target="locale"\`。
需要权限门时再叠 \`AccessProvider\`。`,
  },
  locale: {
    title: "ConfigProvider：非中文应用的必需品（漏了只有读屏用户会发现）",
    body: `组件有一批内置文案：NumberField 的 ± 按钮、Table 空态、Spinner 的 \`role=status\`、
Select 的搜索占位与空态、Tag 的关闭按钮……没有 \`ConfigProvider\` 时它们**静默**回退成 zh-CN。

为什么它比 \`ThemeProvider\` 更容易漏：漏了 ThemeProvider 页面立刻不对；漏了 ConfigProvider
页面**看起来完全正常** —— 回退掉的大半在 \`aria-label\` 里，只有读屏用户和 e2e 断言撞得到。
typecheck / lint / guard 全绿，\`ConfigProvider\` 在类型上也是可选的（hulianui/hulian#164）。
开发期库会就此 \`console.warn\` 一次（生产与测试环境零成本），但那是兜底不是设计。

\`\`\`tsx
import { ConfigProvider, ThemeProvider, enUS } from "@hulianui/ui"

<ThemeProvider>
  <ConfigProvider locale={enUS}>{children}</ConfigProvider>
</ThemeProvider>
\`\`\`

**内置只有 \`zhCN\` / \`enUS\` 两本字典。**其余语言 spread \`enUS\` 再覆盖 —— 这样将来新增的键
自动有英文兜底，不会因为漏键渲染出 \`undefined\`：

\`\`\`ts
import { enUS, type Locale } from "@hulianui/ui"

export const frFR: Locale = {
  ...enUS,
  table: { ...enUS.table, empty: "Aucune donnée" },
  components: {
    ...enUS.components,
    numberField: { decrement: "Diminuer", increment: "Augmenter" },
  },
}
\`\`\`

\`Locale\` 是嵌套两层的：顶层按组件分节（\`table\` / \`proTable\` / \`adminLayout\` / \`modalForm\` /
\`editableTable\` / \`proForm\` / \`stepsForm\` / \`drawer\` / \`loginForm\` / \`clickCaptcha\` /
\`passwordGenerator\`），低层原语的文案统一收在 \`components\` 下（\`popconfirm\` / \`toast\` /
\`alert\` / \`tag\` / \`select\` / \`spinner\` / \`numberField\` / \`upload\` …）。
**别照抄清单**，它会随版本增长；要当前实装版本的完整键清单就从字典自己打：

\`\`\`ts
const walk = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? walk(v, \`\${p}\${k}.\`) : [\`\${p}\${k}\`])
console.log(walk(enUS).join("\\n"))   // 函数型文案（如 proTable.total）打出来是叶子，签名查类型
\`\`\`

多语言产品把它接到自己的 i18n 上，跟着当前语言切：

\`\`\`tsx
const { i18n } = useTranslation()
const locale = useMemo(() => (i18n.resolvedLanguage?.startsWith("zh") ? zhCN : enUS), [i18n.resolvedLanguage])
return <ConfigProvider locale={locale}>{children}</ConfigProvider>
\`\`\``,
  },
  tailwind: {
    title: "token CSS 与 Tailwind 扫描（漏了不是「没样式」，是容器内边距塌掉）",
    body: `全局 CSS 里三行，缺一不可：

\`\`\`css
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset.css";
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
\`\`\`

- \`tokens.css\`：两层 OKLCH 变量（原始层 + 语义层），组件全部吃语义 token。
- \`preset.css\`：\`@theme\` 映射 + 库自带关键帧（\`hulian-*\`），动效与阴影靠它。
- \`@source\`：Tailwind v4 默认不扫 node_modules，漏了这行组件类名会被 purge。路径按你的
  CSS 文件位置改（是 CSS 文件自身所在目录，不是项目根）。

  **别指望症状是「完全没样式」**。在一个已经有 Tailwind 的项目里几乎不会那样，因为
  \`px-4\` / \`gap-2\` / \`rounded-xl\` / \`text-sm\` 这些类你自己的代码里也写，Tailwind 照样
  生成，库组件等于蹭到了。真正精准消失的是只有瑚琏源码里才有的字面量 ——
  Card / Dialog / Drawer 的内边距（\`px-[var(--card-body-px,1.25rem)]\` 这一族）。

  所以典型症状是「**边框、圆角、颜色、字号全对，唯独容器内边距整片塌掉，布局被压扁**」。
  这看着完全不像配置问题，像组件 bug，于是根因被绕开、业务代码里补一句 \`className="p-4"\`
  了事（hulianui/hulian#336 就是这么来的）。

  一条命令分辨：在构建产物 CSS 里 \`grep card-body-px\`。搜不到就是这行漏了。
  （\`@hulianui/tokens\` 0.12.0 起 preset 里有一份 safelist 给这一族兜底，但那只兜容器，
  其余 390 个组件照旧只能靠蹭 —— \`@source\` 该配还得配。）

暗色由 \`[data-theme="dark"]\` 驱动，\`ThemeProvider\` 负责写这个属性。`,
  },
  imports: {
    title: "根 barrel vs 子路径（源码分发的核心取舍）",
    body: `两个入口导出同一份东西，可以混用；差别只在**你的打包器要看多少文件**。

\`\`\`ts
import { Button } from "@hulianui/ui"        // 根 barrel：整棵 src/ 进 dev 模块图
import { Tag } from "@hulianui/ui/tag"       // 子路径：只拉这一棵子树
\`\`\`

子路径名 = 组件目录名（\`ProTable\` → \`@hulianui/ui/pro-table\`）。基础设施件同理：
\`@hulianui/ui/theme\` / \`/access\` / \`/config\` / \`/lib\`。工具入口：\`@hulianui/ui/vite\`、
\`@hulianui/ui/vitest-preset\`。

判断依据（#19 / #34 实测）：只用十几个组件 → 子路径或 Next 的 \`optimizePackageImports\`；
用到大半个库 → 根 barrel 更省事。**这是消费项目的策略选择，不是全库门禁** ——
guard 只拦 exports 之外真正解析不出来的路径（\`_icons\`、\`src/...\`、已移除的 \`date-pickers\`）。`,
  },
  next: {
    title: "Next.js 消费方（最糟的一档，务必配）",
    body: `\`\`\`js
// next.config.mjs
export default {
  transpilePackages: ["@hulianui/ui"],          // 强制项：源码分发必须转译，不加起不来
  experimental: {
    optimizePackageImports: ["@hulianui/ui"],   // 与上一条成对出现，别只写一半
  },
}
\`\`\`

为什么不是「可选优化」：

1. \`transpilePackages\` 是**强制项** —— Next 默认不转译 node_modules，而本库分发的是 TS 源码。
2. webpack **没有依赖预打包**（\`optimizeDeps\` 是 Vite/esbuild 的概念），冷启动不救场。
3. webpack dev **不做 tree-shaking**（\`sideEffects\`/\`usedExports\` 只在 production 生效），
   所以根 barrel 在 dev 下全量进图。

实测（Next 15.5.22 + webpack dev，页面只用 8 个组件）：冷编译 16.5s → **3.9s**，
模块数 7378 → **1730**。它治编译时间与模块图，**不治产物体积**。

**Turbopack 不需要加**（Next 16 起 \`next dev\` 默认 Turbopack）：本仓文档站实测 13.9s / 13.7s
无可测差异 —— Turbopack 自己处理 barrel。加了也无害。`,
  },
  vite: {
    title: "Vite 消费方（装出来的没事，软链的是重灾区）",
    body: `\`pnpm add\` 装进来的会被 Vite 自动预打包，**这一档不需要任何配置**。

坑在**软链消费**（\`link:\` / \`file:\` / pnpm workspace，一边改库一边跑下游）：Vite 有意跳过
linked 包的预构建，整棵 \`src/\` 回到逐文件 transform。实测同一页面（8 个组件）：
浏览器模块请求 16 → **250**，差 15 倍。

\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { hulian } from "@hulianui/ui/vite"

export default defineConfig({ plugins: [react(), hulian()] })
\`\`\`

插件只做一件事：探测瑚琏是不是软链进来的，是就注入 \`optimizeDeps.include\`，不是就什么都不做
——**正常安装的项目加了也无害**，可以无脑写进模板。代价是库源码不再有 HMR（改 packages/ui 要
重启 dev server）；一边改库一边调下游时传 \`hulian({ prebundle: false })\`。

不想加插件就手写等价配置：\`optimizeDeps: { include: ["@hulianui/ui"] }\`。

⚠️ 这个插件和 \`vitest-preset\` **治的不是一件事，不要互相套用**。`,
  },
  vitest: {
    title: "Vitest（不配就会解析出第二份 React）",
    body: `症状：渲染任意瑚琏组件报 \`Cannot read properties of null (reading 'useRef')\`，
栈顶落在第三方包内部 —— 不是组件坏了，是 React 有两份实例。

\`\`\`ts
// vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { withHulian } from "@hulianui/ui/vitest-preset"

export default defineConfig(withHulian({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
}))
\`\`\`

单靠 \`resolve.dedupe\` 不够：分界线是**依赖的模块形态**，瑚琏的依赖横跨四类（纯 ESM peer /
带 exports 的互操作壳 / 只有 legacy main+module 的包 / 自研零依赖件），各需要一条不同配置，
外加 \`test.server.deps.inline\` 覆盖瑚琏这棵树。\`withHulian\` 只做追加去重，你已写的同名字段
优先级更高；想自己拼可单独取 \`hulianDedupe\` / \`hulianConditions\` / \`hulianMainFields\` /
\`hulianInlineDeps\`。`,
  },
};

/** 按 target 返回接入指南；不传返回全部。 */
export function setupGuide(target) {
  const keys =
    !target || target === "all"
      ? SETUP_TARGETS
      : SETUP_TARGETS.filter((key) => key === String(target).toLowerCase());
  if (!keys.length) {
    return {
      ok: false,
      text: `未知 target "${target}"。可选：${SETUP_TARGETS.join(" / ")} / all。`,
    };
  }
  const body = keys
    .map((key) => `## ${SECTIONS[key].title}\n\n${SECTIONS[key].body}`)
    .join("\n\n---\n\n");
  return {
    ok: true,
    targets: keys,
    text: `# 瑚琏消费方接入\n\n${body}\n\n> 完整实测数据与取舍见 ${DOC}`,
  };
}
