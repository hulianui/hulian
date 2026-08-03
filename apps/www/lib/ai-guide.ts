// 瑚琏 · AI 接入指南正文（单一真源）。/start 页面渲染它，同时供「复制全文」按钮拷给 AI 编程助手。
import { manifest } from "./manifest";

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

## 装 MCP：让 AI 自己查，而不是你贴文档

\`@hulianui/mcp\` 把「你的项目长什么样 / 有什么 / 怎么用 / 不许怎么用 / 写完对不对 / 存量代码该从哪改起」变成 AI 可按需调用的 tool。装上之后，AI 不必整吞全库语料，也不会再猜错 props 签名。

### 一行接入

\`\`\`bash
npx @hulianui/mcp init-agent
\`\`\`

它把使用契约写进各家客户端各自读取的文件：\`CLAUDE.md\`（Claude Code）、\`AGENTS.md\`（Codex / Copilot agents）、\`.cursor/rules/hulianui.mdc\`（Cursor）、\`.github/copilot-instructions.md\`（GitHub Copilot）。契约包在 marker 注释之间，**不动你已有的内容**，重复运行文件逐字节不变。

\`\`\`bash
npx @hulianui/mcp init-agent --check    # 只报告，有待办时非 0 退出，可进 CI
npx @hulianui/mcp init-agent --doctor   # 体检：装在哪、是否最新、MCP 配没配
npx @hulianui/mcp init-agent --all      # 四家客户端全覆盖
\`\`\`

### MCP server 配置

Claude Code / Cursor：

\`\`\`json
{
  "mcpServers": {
    "hulianui": { "command": "npx", "args": ["-y", "@hulianui/mcp"] }
  }
}
\`\`\`

### 十个 tool（表格顺序就是推荐的调用顺序）

| tool | AI 什么时候该调 |
| --- | --- |
| \`inspect_project\` | **开工前**。认项目：框架、包管理器、瑚琏实装版本、ThemeProvider / token CSS / Vitest 接入状态 |
| \`get_agent_profile\` | 认完项目、动手之前。按场景取「该用什么组件语言、受什么约束、按什么步骤走」；原型阶段务必传 \`workflow: "prototype"\` |
| \`recommend_ui\` | 拿到一句业务需求时。返回排序后的**页面 → 区块 → 组件**组合，先看有没有现成整页可复用 |
| \`list_components\` | 需要按关键词补齐候选时。\`kind\` 取 component / block / page / lib，\`limit\` + \`offset\` 翻页 |
| \`get_component_doc\` | 写下第一行使用某组件的代码**之前**（Props / Events / Slots / 示例 / 禁忌坑），\`names\` 可一次取多个 |
| \`get_conventions\` | 开始新页面 / 新功能**之前**；分别取得可执行门禁与仍需语境判断的建议 |
| \`get_setup_guide\` | \`inspect_project\` 报了接入缺口时。\`target\` 取 install / tailwind / imports / next / vite / vitest |
| \`install_block\` | 要把**区块或整页**积木放进项目时；同时取得递归区块、Provider、必须替换项、插槽和 guard 命令 |
| \`validate_hulian_usage\` | **改完瑚琏相关代码必须调**；返回带 \`ruleId\` / \`file\` / \`line\` 的结构化诊断 |
| \`audit_hulian_adoption\` | 接手**已经有代码**的项目时；给实际使用清单、该用没用上的机会点、疑似绕过的风险项与迁移计划 |

三个「检查类」tool 各答一个问题，不得互相冒充：\`inspect_project\` 答**装没装对**（事实），\`validate_hulian_usage\` 答**有没有违反硬规则**（可静态证明的错误），\`audit_hulian_adoption\` 答**该用的有没有用上**（带置信度的建议，**不产生 error，别当门禁用**）。

### 存量项目：先体检，再立基线

\`\`\`bash
npx @hulianui/mcp audit                       # 看现状
npx @hulianui/mcp audit --workflow prototype  # 原型口径：不推高层企业件
npx @hulianui/mcp audit --write-baseline      # 接受现有债务，立基线
npx @hulianui/mcp audit --baseline --check    # 进 CI：只拦新增违规
\`\`\`

存量项目的正确用法是先 \`--write-baseline\` 把现有债务接受下来，之后 CI 用 \`--check\` 只拦新增。拿全量合规当门禁，唯一的结果是第一次几百条之后整个门禁被关掉。

> **guard 通过 ≠ 页面对了**：\`validate_hulian_usage\` 只检查瑚琏专属约束（style 覆盖、\`toast.success\`、颜色 token 前缀、私有深导入等）。typecheck、单元测试、交互 / a11y、真实视觉验证都在别处。

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
