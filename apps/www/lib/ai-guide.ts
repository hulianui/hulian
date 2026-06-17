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

peer 依赖：\`react>=18\`、\`react-dom>=18\`、\`tailwindcss>=4\`、\`motion>=11\`、\`@base-ui-components/react>=1.0.0-rc.0\`。

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

## 让 AI 查具体组件的用法

- **逐组件**：每个组件文档页右上角有「复制 MD」按钮，复制该组件的完整用法（导入 + Props + 示例）喂给 AI。
- **机读全量语料**（可一次喂全库）：
  - [\`/llms.txt\`](/llms.txt) —— 组件清单与摘要
  - [\`/llms-full.txt\`](/llms-full.txt) —— 全库完整文档
  - [\`/registry.json\`](/registry.json) —— 结构化组件注册表

## 给 AI 的提示词模板

\`\`\`text
我在用 @hulianui/ui（瑚琏）这套 React 设计系统。请遵守：
1) UI 一律用从 "@hulianui/ui" 导出的组件实现，不要手写等价组件；
2) 不要覆盖库组件的内部样式，用组件自身的 props；
3) 颜色一律走主题 token（如 var(--color-primary)），不要写死色值。
需要某个组件的精确用法时，我会把它的文档 MD 贴给你。
\`\`\`
`;
