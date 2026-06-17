<p align="center">
  <img src="apps/www/app/opengraph-image.png" alt="瑚琏 Hulian —— 颜值 + 好用的 React 设计系统" width="820">
</p>

<h1 align="center">瑚琏 Hulian</h1>

<p align="center">
  颜值 + 好用的 React 设计系统 —— <b>349 个组件</b>，OKLCH 主题 · Tailwind v4 · 暗色零闪烁 · 运行时换肤。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hulianui/ui"><img src="https://img.shields.io/npm/v/@hulianui/ui?color=2563eb&label=%40hulianui%2Fui" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@hulianui/ui"><img src="https://img.shields.io/npm/dm/@hulianui/ui?color=2563eb" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/@hulianui/ui?color=2563eb" alt="license MIT"></a>
  <a href="https://github.com/hulianui/hulian/actions/workflows/ci.yml"><img src="https://github.com/hulianui/hulian/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/hulianui/hulian/stargazers"><img src="https://img.shields.io/github/stars/hulianui/hulian?style=flat&color=2563eb" alt="stars"></a>
</p>

<p align="center">
  <a href="https://hulianui.haloritual.com"><b>📖 文档站</b></a> ·
  <a href="https://hulianui.haloritual.com/demos"><b>🏗️ 在线 Demo</b></a> ·
  <a href="README.en.md"><b>English</b></a>
</p>

---

> 名出《论语·公冶长》"瑚琏也"——宗庙盛黍稷的玉器，至贵至美又确有大用。
> **颜值审美 + 好用 = 软件商业化第一生产力。人不该油头满面地对着丑/烂软件干活。**

**瑚琏**是一套可直接 `import` 的 React 组件库，配套一个真实数据驱动、可调参的 [showcase 文档站](https://hulianui.haloritual.com)。基于 Base UI 的无障碍行为层 + Tailwind v4 的 OKLCH 双层 token 皮肤，明暗切换 0 闪烁、支持运行时换肤。

## ✨ 特性

- 🧩 **349 个组件** —— 基础控件 / 表单 / 数据展示 / 反馈 / 导航 / overlay / 图表 / 特效背景 / AI 智能体 / 直播 / 节点画布 …
- 🎨 **OKLCH 双层 token** —— 原始层 + 语义层，切 `[data-theme]` 明暗 0 闪烁，运行时即可换肤
- ♿ **无障碍优先** —— 行为层基于 [Base UI](https://base-ui.com)，键盘 / 焦点 / ARIA 开箱即用
- 🌗 **暗色零闪烁** —— `ThemeProvider` + 入口 inline script，SSR 首屏不白闪
- 📦 **零 token 公开安装** —— 发布在公共 npmjs，`pnpm add @hulianui/ui` 一行装上
- 🔧 **源码分发** —— 发 TSX 源码，样式可被你的 Tailwind 完整接管，无黑盒 CSS
- 📚 **AI-first 文档** —— 每个组件含 Props/Events/Slots + 活示例 + playground，并生成 `llms.txt`
- 🏗️ **18 个真实 demo** —— CRM / 商城 / 数据大屏 / AI 工作流 / 直播 … 全部 dogfood 自家组件

## 📦 快速开始

**1. 安装**（公共 npmjs，零配置零 token）

```bash
pnpm add @hulianui/ui @hulianui/tokens
# peer：react · react-dom · tailwindcss · @base-ui/react · motion
```

**2. 引入 token + preset，并把组件源码加入 Tailwind 扫描**（全局 CSS）

```css
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset.css";
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
```

**3. 包一层 `ThemeProvider` 即可用**

```tsx
import { ThemeProvider, Button } from "@hulianui/ui";

export default function App() {
  return (
    <ThemeProvider defaultSetting="system">
      <Button>瑚琏</Button>
    </ThemeProvider>
  );
}
```

> 发布形态是**源码包**（发 `src/`，不编译 dist），消费方需能转译 TSX：**Next.js** 加 `transpilePackages: ["@hulianui/ui"]`，**Vite** 一般免配。防首屏白闪的 inline script 由各应用入口注入（参考 [`apps/www/app/theme-script.tsx`](apps/www/app/theme-script.tsx)）。

完整接入说明见 **[文档站 · 快速开始](https://hulianui.haloritual.com)**。

## 🧩 组件与示例

- **组件库**：349 个组件，覆盖中后台、营销站、电商、AI 应用、移动端等场景 —— [浏览全部](https://hulianui.haloritual.com)
- **区块 / 页面 / 示例**：从真实 demo 抽离的整段区块与整页模板，复制即用
- **18 个内置 demo**：CRM · 商城 · 客服 · 数据大屏 · 知识库 · 直播 · AI 工作流 · API 网关 · 智能体调度 · 项目协同 · LMS · 个人站 · 官网 · 订阅结算 · 代码审查 · 排期 · 移动端 · AI 对话 —— [在线体验](https://hulianui.haloritual.com/demos)

## 🛠️ 技术地基

- **Base UI**（`@base-ui/react`，headless 行为 / a11y）
- **Tailwind v4** + 两层 OKLCH CSS 变量 token（原始层 + 语义层）
- **class-variance-authority** 管变体 · **lucide-react** 图标 · **motion** 动效
- monorepo：**pnpm + Turborepo** · 文档站 **Next.js 16 + React 19**

```
packages/
  ui/      @hulianui/ui      组件库本体（Base UI + Tailwind 皮肤）
  tokens/  @hulianui/tokens  设计 token（明暗主题唯一源头）
  mocks/   @hulianui/mocks   faker 数据工厂 + MSW handlers（喂给 showcase · 私有）
apps/
  www/     Next.js 文档站（首个 dogfood 消费者）
```

## 🤝 参与贡献

欢迎 issue 与 PR！本地开发：

```bash
pnpm install
pnpm --filter www dev   # 文档站 http://localhost:5512
pnpm test               # 全量单测（vitest · 2705 用例 / 367 文件）
pnpm typecheck
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md) · [行为准则](CODE_OF_CONDUCT.md) · 安全问题请走 [SECURITY.md](SECURITY.md) · 发布流程见 [docs/publishing.md](docs/publishing.md)。

## 📄 许可证

[MIT](LICENSE) © hulianui
