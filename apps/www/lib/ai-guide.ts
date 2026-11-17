// 瑚琏 · AI 接入指南正文（单一真源）。/start 页面渲染它，同时供「复制全文」按钮拷给 AI 编程助手。
import { manifest } from "./manifest";
import { AI_GUIDE_EN_MD } from "./ai-guide.en";
import { basePathForLocale, type DocsLocale } from "./docs-locale";
import { SITE_URL } from "./site";

const total = manifest.length;
// 中文文档站的根地址，前缀由语言布局 SSOT 决定。
const ZH_BASE = `${SITE_URL}${basePathForLocale("zh-CN")}`;

export const AI_GUIDE_MD = `# 瑚琏 Hulian（@hulianui/ui）AI 接入指南

> 把这份文档整段复制给你的 AI 编程助手（Claude Code / Cursor / Copilot 等），它就能正确地用瑚琏搭界面。

瑚琏是一套「颜值 + 好用」的 React 设计系统，共 ${total} 个组件，全部从 \`@hulianui/ui\` 导出，并统一使用主题 token。

## 安装

\`\`\`bash
pnpm add @hulianui/ui @hulianui/tokens
\`\`\`

> \`@hulianui/tokens\` 提供主题 CSS（下一步会 \`@import\` 它），是 \`@hulianui/ui\` 的必备同伴包，务必一起装。

peer 依赖：\`react>=18\` \`react-dom>=18\` \`tailwindcss>=4\` \`motion>=11\` \`@base-ui/react>=1.0.0\`

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
2. **统一从根入口导入**：\`import { Button, DatePicker, Table } from "@hulianui/ui"\`，没有任何子路径入口（日期族也在根入口）。
3. **吃主题 token，不要写死颜色**：给 SVG 的 \`fill\`/\`stroke\` 或内联样式用 \`var(--color-primary)\`、\`var(--color-foreground)\` 等，**颜色变量必须带 \`--color-\` 前缀**，否则 Tailwind v4 下解析不到。
4. **不要用局部 \`style\`/\`className\` 覆盖库组件内部结构**：用组件自身暴露的 props 调整外观与行为。
5. **动手前先查文档，不要凭印象猜 props**：装了 MCP 就调 \`get_component_doc\`，否则取 ${ZH_BASE}/d/<组件slug>.md。

## 装 MCP：让 AI 自己查，而不是你贴文档

\`@hulianui/mcp\` 让 AI 按需查组件、用法与约束，不必整吞全库语料，也不会猜错 props 签名。

\`\`\`bash
npx @hulianui/mcp init-agent
\`\`\`

它把使用契约写进各家客户端读取的文件（\`CLAUDE.md\`、\`AGENTS.md\`、\`.cursor/rules/hulianui.mdc\` 等），**不动你已有的内容**。

MCP server 配置（Claude Code / Cursor）：

\`\`\`json
{
  "mcpServers": {
    "hulianui": { "command": "npx", "args": ["-y", "@hulianui/mcp"] }
  }
}
\`\`\`

接上之后，MCP 会自己告诉 AI 每个 tool 何时调、按什么顺序调。完整 tool 清单与存量项目体检见 [@hulianui/mcp 文档](https://www.npmjs.com/package/@hulianui/mcp)。

没装 MCP 时，让 AI 直接取机读文档：单个组件 ${ZH_BASE}/d/<组件slug>.md，组件清单 ${ZH_BASE}/llms.txt。每个组件文档页右上角也有「复制 MD」按钮。

## 直接安装积木（区块 / 整页）

区块通常可直接落盘；页面可能由多个区块组成。registry 会通过 \`registryDependencies\` 递归安装页面所需区块，并把仓库内路径改写为消费项目可解析的同级路径：

\`\`\`bash
npx shadcn@latest add ${ZH_BASE}/r/block-pricing-table.json
npx shadcn@latest add ${ZH_BASE}/r/page-dashboard.json
\`\`\`

安装输出中的示例数据、文案、接口回调与 Provider 要按 item 的 \`replace\` / \`providers\` 清单处理；可组合区域见 \`slots\`。完成后运行：

\`\`\`bash
npx -y @hulianui/guard src
\`\`\`

组件一般**不需要**这样装 —— 直接 \`import\` 即可，只有要魔改组件本身时才注入源码。完整可装清单见 \`registry.json\`。

## 给 AI 的提示词模板

\`\`\`text
我在用 @hulianui/ui（瑚琏）这套 React 设计系统。
请先读下面这份接入指南，并严格遵守其中的「铁律」：
${ZH_BASE}/start
需要整块界面（登录页、定价表、控制台骨架…）时，
先看 registry 里的 block / page，能复用就别从零写。
\`\`\`
`;

/** Build-time selector used by the copy button; English never falls back to Chinese. */
export function aiGuide(locale: DocsLocale): string {
  return locale === "en" ? AI_GUIDE_EN_MD : AI_GUIDE_MD;
}

/**
 * 去掉正文开头的 H1 与紧随其后的引言，供 /start 页面渲染。
 *
 * 这份 Markdown 有两个消费方，需求正相反：复制给 AI 编程助手时，标题与「把这份文档整段
 * 复制给你的助手」的引言是必要的上下文；而在 /start 页面上，页头已经把同样的两句话说过
 * 一遍了，正文再来一遍就是同一屏内的双标题。所以剥离只发生在渲染这一侧，复制按钮拿的
 * 始终是完整原文。
 */
export function aiGuideBody(md: string): string {
  const lines = md.split("\n");
  let i = 0;
  if (!lines[i]?.startsWith("# ")) return md;
  i++;
  while (lines[i]?.trim() === "") i++;
  // 引言是可选的：只有紧跟标题的那段 blockquote 算引言，正文中间的引用块不受影响。
  if (lines[i]?.startsWith("> ")) {
    while (i < lines.length && lines[i].trim() !== "") i++;
    while (i < lines.length && lines[i].trim() === "") i++;
  }
  return lines.slice(i).join("\n");
}
