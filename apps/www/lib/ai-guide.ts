// 瑚琏 · AI 接入指南正文（单一真源）。/start 页面渲染它，同时供「复制全文」按钮拷给 AI 编程助手。
import { manifest } from "./manifest";
import { AI_GUIDE_EN_MD } from "./ai-guide.en";
import type { DocsLocale } from "./docs-locale";

const total = manifest.length;

export const AI_GUIDE_MD = `# 瑚琏 Hulian（@hulianui/ui）· AI 接入指南

> 把这份文档整段复制给你的 AI 编程助手（Claude Code / Cursor / Copilot 等），它就能正确地用瑚琏搭界面。

瑚琏是一套「颜值 + 好用」的 React 设计系统，共 ${total} 个组件。除下文单独说明的日期族子路径外，组件统一从 \`@hulianui/ui\` 导出，并统一使用主题 token。

## 安装

\`\`\`bash
pnpm add @hulianui/ui @hulianui/tokens
\`\`\`

> \`@hulianui/tokens\` 提供主题 CSS（下一步会 \`@import\` 它），是 \`@hulianui/ui\` 的必备同伴包，务必一起装。

peer 依赖：\`react>=18\`、\`react-dom>=18\`、\`tailwindcss>=4\`、\`motion>=11\`、\`@base-ui/react>=1.0.0\`。

## 接入 CSS（Tailwind v4）

在全局样式文件顶部按顺序引入 token 与 preset，并让 Tailwind 扫到库源码里的 className：

\`\`\`css
/* 设计 token：颜色 / 半径 / 阴影等 CSS 变量（明暗主题真源） */
@import "@hulianui/tokens/tokens.css";
/* Tailwind v4 preset：语义 token → 工具类，dark variant 绑定 [data-theme] */
@import "@hulianui/tokens/preset.css";
/* 瑚琏以 TS 源码分发，需把它纳入 Tailwind 扫描范围（路径相对你的 CSS 文件） */
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
\`\`\`

## 包裹 Provider

应用根部包 \`ThemeProvider\`（明暗主题）；命令式浮层各挂一次 Provider：

\`\`\`tsx
import {
  ThemeProvider,
  ToastProvider,
  ModalProvider,
  NotificationProvider,
} from "@hulianui/ui";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultSetting="system">
      {children}
      {/* toast() / modal.*() / notification.*() 依赖这些全局挂载点 */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </ThemeProvider>
  );
}
\`\`\`

## 铁律（请严格遵守）

1. **只用 \`@hulianui/ui\` 组件**：缺什么先到库里找近似件，不要手写等价组件、不要重复造轮子。
2. **统一导入**：\`import { Button, Card, Table } from "@hulianui/ui"\`，所有组件都从根入口取。
3. **吃主题 token，不要写死颜色**：给 SVG 的 \`fill\`/\`stroke\` 或内联样式用 \`var(--color-primary)\`、\`var(--color-foreground)\` 等，**颜色变量必须带 \`--color-\` 前缀**，否则 Tailwind v4 下解析不到。
4. **不要用局部 \`style\`/\`className\` 覆盖库组件内部结构**：用组件自身暴露的 props 调整外观与行为。

## 全部组件都在根 barrel 里

0.15.0 起没有任何例外入口：日期族（\`Calendar\` / \`DatePicker\` / \`DateTimePicker\` / \`TimeField\` /
\`TimePicker\` / \`DateRangePicker\`）已全部自研为零依赖，\`@hulianui/ui/date-pickers\` 这条子路径、
以及它要求的 MUI 与 emotion 四个 optional peer 都不复存在。

\`\`\`tsx
import { DatePicker, DateTimePicker, TimeField, Calendar } from "@hulianui/ui";
\`\`\`

若你手上的资料还写着「日期族要装 @mui/* 并挂 MuiBridgeProvider」，那是 0.15.0 之前的旧文档。

## 推荐：装 MCP，让 AI 自己查（而不是你贴文档）

\`@hulianui/mcp\` 把「有什么 / 怎么用 / 不许怎么用」变成 AI 可按需调用的 tool。装上之后，AI 不必整吞全库语料，也不会再猜错 props 签名。

Claude Code / Cursor 的 MCP 配置：

\`\`\`json
{
  "mcpServers": {
    "hulianui": { "command": "npx", "args": ["-y", "@hulianui/mcp"] }
  }
}
\`\`\`

四个 tool：

| tool | AI 什么时候该调 |
| --- | --- |
| \`list_components\` | 写任何 UI **之前**。\`kind\` 可取 component / block / page / lib |
| \`get_component_doc\` | 写下第一行使用某组件的代码**之前**（Props / Events / Slots / 示例 / 禁忌坑） |
| \`install_block\` | 要把**区块或整页**积木放进项目时；同时取得递归区块、Provider、必须替换项、插槽和 guard 命令 |
| \`get_conventions\` | 开始新页面 / 新功能**之前**；分别取得可执行门禁与仍需语境判断的建议 |

## 让 AI 查具体组件的用法（没装 MCP 时）

- **逐组件**：每个组件文档页右上角有「复制 MD」按钮（导入 + Props + 示例）；组件页 URL 形如 \`https://hulianui.haloritual.com/components/<组件名小写连字符>\`（如 button / pro-table），有抓取能力的 AI 可直接取。
- **机读语料**（下列均为**绝对 URL**，可直接交给有联网/抓取能力的 AI）：
  - https://hulianui.haloritual.com/d/<slug>.md —— **单个组件**的完整文档，按需取，最省 context
  - https://hulianui.haloritual.com/llms.txt —— 组件清单与摘要
  - https://hulianui.haloritual.com/llms-full.txt —— 全库完整文档（1MB+，优先用上面的单件端点）
  - https://hulianui.haloritual.com/registry.json —— 结构化注册表（组件 / 区块 / 页面）
  - https://hulianui.haloritual.com/conventions.json —— 机器可读的使用约束

## 直接安装积木（区块 / 整页）

区块通常可直接落盘；页面可能由多个区块组成。registry 会通过 \`registryDependencies\` 递归安装页面所需区块，并把仓库内路径改写为消费项目可解析的同级路径：

\`\`\`bash
npx shadcn@latest add https://hulianui.haloritual.com/r/block-pricing-table.json
npx shadcn@latest add https://hulianui.haloritual.com/r/page-dashboard.json
\`\`\`

安装输出中的示例数据、文案、接口回调与 Provider 要按 item 的 \`replace\` / \`providers\` 清单处理；可组合区域见 \`slots\`。完成后运行：

\`\`\`bash
npx -y @hulianui/guard src
\`\`\`

组件一般**不需要**这样装 —— 直接 \`import\` 即可，只有要魔改组件本身时才注入源码。完整可装清单见 \`registry.json\`。

## 给 AI 的提示词模板

\`\`\`text
我在用 @hulianui/ui（瑚琏）这套 React 设计系统。请遵守：
1) UI 一律用从 "@hulianui/ui" 导出的组件实现，不要手写等价组件；
2) 不要覆盖库组件的内部样式，用组件自身的 props；
3) 颜色一律走主题 token（如 var(--color-primary)），且必须带 --color- 前缀；
4) 动手前先查文档，不要凭印象猜 props —— 装了 MCP 就调 get_component_doc，
   否则取 https://hulianui.haloritual.com/d/<组件slug>.md。
需要整块界面（登录页、定价表、控制台骨架…）时，先看 registry 里的 block / page，
能复用就别从零写；安装后执行 MCP 返回的 hulian-check 命令并修完错误级违规。
\`\`\`
`;

/** Build-time selector used by the copy button; English never falls back to Chinese. */
export function aiGuide(locale: DocsLocale): string {
  return locale === "en" ? AI_GUIDE_EN_MD : AI_GUIDE_MD;
}
