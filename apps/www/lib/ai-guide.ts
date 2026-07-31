// 瑚琏 · AI 接入指南正文（单一真源）。/start 页面渲染它，同时供「复制全文」按钮拷给 AI 编程助手。
import { manifest } from "./manifest";

const total = manifest.length;

export const AI_GUIDE_MD = `# 瑚琏 Hulian（@hulianui/ui）· AI 接入指南

> 把这份文档整段复制给你的 AI 编程助手（Claude Code / Cursor / Copilot 等），它就能正确地用瑚琏搭界面。

瑚琏是一套「颜值 + 好用」的 React 设计系统，共 ${total} 个组件，全部从单一入口 \`@hulianui/ui\` 导出，开箱即用、统一吃主题 token。

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

## 唯一的例外：日期族走子路径

\`Calendar\` / \`DatePicker\` / \`DateTimePicker\` / \`TimeField\` **不在根 barrel 里**，它们依赖 optional peer（MUI X + emotion），要用得多两步：

\`\`\`bash
pnpm add @mui/material @mui/x-date-pickers @emotion/react @emotion/styled
\`\`\`

\`\`\`tsx
import { DatePicker, MuiBridgeProvider } from "@hulianui/ui/date-pickers";
// 且这几件必须置于 <MuiBridgeProvider> 之内，否则真实浏览器里会抛 Unsupported color
\`\`\`

不用日期族的项目完全不用管这一节 —— 那四个包一个都不会装。
其余全部组件（含 Rating / Stepper）正常从 \`@hulianui/ui\` 根 barrel 导入。

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
| \`install_block\` | 要把**区块或整页**积木放进项目时（自包含，落盘即用） |
| \`get_conventions\` | 开始新页面 / 新功能**之前**，取强制约束 |

## 让 AI 查具体组件的用法（没装 MCP 时）

- **逐组件**：每个组件文档页右上角有「复制 MD」按钮（导入 + Props + 示例）；组件页 URL 形如 \`https://hulianui.haloritual.com/components/<组件名小写连字符>\`（如 button / pro-table），有抓取能力的 AI 可直接取。
- **机读语料**（下列均为**绝对 URL**，可直接交给有联网/抓取能力的 AI）：
  - https://hulianui.haloritual.com/d/<slug>.md —— **单个组件**的完整文档，按需取，最省 context
  - https://hulianui.haloritual.com/llms.txt —— 组件清单与摘要
  - https://hulianui.haloritual.com/llms-full.txt —— 全库完整文档（1MB+，优先用上面的单件端点）
  - https://hulianui.haloritual.com/registry.json —— 结构化注册表（组件 / 区块 / 页面）
  - https://hulianui.haloritual.com/conventions.json —— 机器可读的使用约束

## 直接安装积木（区块 / 整页）

区块与整页是**自包含**的（只从 \`@hulianui/ui\` 根 barrel 导入），可直接注入项目后改业务字段：

\`\`\`bash
npx shadcn@latest add https://hulianui.haloritual.com/r/block-pricing-table.json
npx shadcn@latest add https://hulianui.haloritual.com/r/page-dashboard.json
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
能复用就别从零写。
\`\`\`
`;
