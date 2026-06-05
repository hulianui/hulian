<p align="center">
  <img src="apps/www/app/opengraph-image.png" alt="瑚琏 Hulian —— 颜值 + 好用的 React 设计系统" width="820">
</p>

# 瑚琏 Hulian

> 颜值 + 好用的 React 设计系统。
>
> 名出《论语·公冶长》"瑚琏也"——宗庙盛黍稷的玉器，至贵至美又确有大用。
> **颜值审美 + 好用 = 软件商业化第一生产力。人不该油头满面地对着丑/烂软件干活。**

一套**可发布的 React 设计系统**（能 `import` 的 npm 组件库）+ 一个**完整 showcase 文档站**（真实样例数据 / 全状态 / MSW API mock / 可调参 playground）。全局明亮/暗黑，切换 0 闪烁、可运行时换肤。

## 技术地基

站在巨人肩膀上博采众长：

- **Base UI**（`@base-ui-components/react`，headless 行为 / a11y）+ Radix 补缺
- **Tailwind v4 + 两层 CSS 变量 token**（原始 OKLCH 层 + 语义层，切 `[data-theme]` 0 闪烁）
- **class-variance-authority** 管变体 · **lucide-react** 图标 · **motion** 动效（后续）
- monorepo：**pnpm + Turborepo** · **Next.js 16** 文档站 · **React 19**

## 快速开始

```bash
pnpm install
pnpm dev            # 文档站起在 http://localhost:5512（非常规端口，避开本地热门口）
```

其它脚本：

```bash
pnpm typecheck      # 全量类型检查
pnpm test           # 全量单测（vitest）
pnpm --filter www build   # 生产构建
```

## 目录结构

```
hulian/
├── packages/
│   ├── tokens/   @hulianui/tokens   设计 token（tokens.css + Tailwind v4 preset）— 明暗主题唯一源头
│   ├── ui/       @hulianui/ui       组件库本体（Base UI + Tailwind 皮肤）— 可发 npm
│   └── mocks/    @hulianui/mocks    faker 数据工厂 + MSW handlers — 喂给 showcase
└── apps/
    └── www/      Next.js 文档站（5512）— 首个 dogfood 消费者
```

## 接入方式（分发模型 A）

消费方需用 Tailwind v4，三步接入：

1. 装包：`pnpm add @hulianui/ui @hulianui/tokens`（`react` / `react-dom` / `tailwindcss` / `@base-ui-components/react` 为 peer，自行安装）
2. 全局引入 token + preset，并把 `@hulianui/ui` 源码加入 Tailwind 扫描：
   ```css
   @import "@hulianui/tokens/tokens.css";
   @import "@hulianui/tokens/preset.css";
   @source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
   ```
3. 用组件 + 包一层 `ThemeProvider`：
   ```tsx
   import { ThemeProvider, Button } from "@hulianui/ui";
   <ThemeProvider defaultSetting="system"><Button>瑚琏</Button></ThemeProvider>
   ```
   防首屏白闪的 inline script 由各应用的入口注入（见 `apps/www/app/theme-script.tsx`），不入库。

## 当前状态

**P0 脊柱 + P1 展示基建 已完成并验证**（截图 + 三道门：typecheck / test / build 全绿）：

- ✅ monorepo + OKLCH 两层 token + Tailwind v4 preset
- ✅ ThemeProvider（框架无关）+ 明暗切换 0 闪烁
- ✅ 三标杆组件：**Button**（CVA 变体）/ **Switch**（受控+ARIA）/ **Dialog**（Portal+focus trap，验证 Base UI 命脉）
- ✅ showcase 四 mock：真实样例数据(faker) / 全状态 gallery / MSW 异步分页 / 可调参 playground

**后续**：P2 组件扩量（Input/Select/DataTable…）· P3 npm 发布 + 部署 · P4 Tauri 桌面壳。

设计文档见 `docs/superpowers/specs/`，实施计划见 `docs/superpowers/plans/`。
