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
- **class-variance-authority** 管变体 · **lucide-react** 图标 · **motion** 动效
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
pnpm run install-hooks    # 装 git hooks（clone 后跑一次；post-commit 自动再生成 ~/.claude/skills/hulianui-index）
pnpm run skill-index      # 手动再生成 AI 组件索引 skill
```

## 目录结构

```
hulian/
├── packages/
│   ├── tokens/   @hulianui/tokens   设计 token（tokens.css + Tailwind v4 preset）— 明暗主题唯一源头
│   ├── ui/       @hulianui/ui       组件库本体（Base UI + Tailwind 皮肤）— 已发 GitHub Packages
│   └── mocks/    @hulianui/mocks    faker 数据工厂 + MSW handlers — 喂给 showcase
└── apps/
    └── www/      Next.js 文档站（5512）— 首个 dogfood 消费者
```

## 接入方式（分发模型 A）

`@hulianui/*` 发布在 **GitHub Packages 私有 registry**（组织 `hulianui`），不是公共 npmjs。消费方需先配 registry + 鉴权，再用 Tailwind v4 接入：

0. **配 registry + 鉴权**（GitHub Packages 即使包公开也要求 token，见下方「私有 → 公有」）：

   a. 建一个有 `read:packages` 权限的 PAT —— GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → 勾 **`read:packages`**，生成后存环境变量（勿写进文件提交）：
   ```bash
   export GITHUB_TOKEN=ghp_xxxxx
   ```
   b. 目标项目根建 `.npmrc`，把 `@hulianui` 作用域指向 GitHub Packages：
   ```ini
   @hulianui:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
1. 装包：`pnpm add @hulianui/ui @hulianui/tokens`（npm / yarn 同理 `install`；`react` / `react-dom` / `tailwindcss` / `@base-ui-components/react` 为 peer，自行安装）
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

### 私有 → 公有？

注意一个反直觉点：**把 GitHub Packages 上的包设为 public，安装时仍然要求 token**（GH Packages 的 npm registry 即便公开也强制鉴权，和 npmjs 不同）。设公开只是让任何人可见、任何 GitHub 账号的 token 都能装，省不掉第 0 步的 `.npmrc`。

要**真正免 token 公开安装**，得把 registry 换成公共 **npmjs.com**（scope 仍 `@hulianui`，需在 npmjs 注册同名组织 + 配 `NPM_TOKEN`）。切换步骤见 `docs/publishing.md`。

> 发布形态是**源码包**（发 `src/`，不编译 dist）——消费方需能转译 TSX（Next / Vite 可）。版本管理 + 发布流程见 `docs/publishing.md`。

## 发版（维护者）

用 **changesets** 管版本，**GitHub Actions 自动发布**到 GitHub Packages（CI 内用内置 `GITHUB_TOKEN`，零 PAT）。改完代码后三步：

```bash
# 1. 记一条变更（交互：选包 @hulianui/ui / @hulianui/tokens + patch/minor + 写说明）
pnpm changeset
# 2. 本地落版本号 + 写 CHANGELOG（消费掉 changeset）
pnpm version-packages
# 3. 提交并推送（特性 commit 可单独先提，这步只提 package.json + CHANGELOG）
git add -A && git commit -m "chore(release): bump" && git push
```

push 到 `master` 后 `release.yml` 自动 `changeset publish` 发布版本号高于 registry 的包，并打 git tag。下游 `pnpm update @hulianui/ui @hulianui/tokens` 即可。

> **关键：务必本地先 `pnpm version-packages` 再 push**（上面第 2 步不能省）。
> 原因：若只 push 了 `.changeset/*.md` 而没 version，CI 会去开「Version Packages」PR；而本组织当前**关着「允许 Actions 创建 PR」**，那条路会卡住。本地先落版本 → CI 看到没有待消费 changeset → 直接 publish，绕开 PR。
>
> 已验证版本：ui `0.1.0 → 0.1.1 → 0.1.2`、tokens `0.1.0 → 0.1.1`。完整说明 + 私有/公有切换见 `docs/publishing.md`。

## 当前状态

**已发布、CI/CD 上线、组件大批量铺开**：

- 📦 **已发 GitHub Packages**：`@hulianui/ui@0.1.2` + `@hulianui/tokens@0.1.1`（私有 registry · changesets 管版本 · GitHub Actions 自动发布，用内置 `GITHUB_TOKEN` 零 PAT）
- 🌐 **文档站上线**：[hulianui.haloritual.com](https://hulianui.haloritual.com)（Cloudflare Pages · 静态导出 · push 自动重发）
  - 🇨🇳 **中国镜像**：[hulianui-zh.haloritual.com](https://hulianui-zh.haloritual.com)（阿里云直连 · 绕开 Cloudflare · push 到 master 后 `deploy-zh` job 自动 rsync 同一份静态产物 · 与 Cloudflare 双发）
- 🧩 **~228 个组件**：基础控件 / 表单 / 数据展示 / 反馈 / 导航 / overlay / 图表 / 特效背景 / AI 智能体 / 直播 / 节点画布 …
- 🏗️ **18 个内置 demo**（全 dogfood）：CRM · 商城 · 客服 · 数据大屏 · 知识库 · 直播 · AI 工作流 · API 网关 · 智能体调度 · 项目协同 · LMS · 个人站 · 官网 · 订阅结算 · 代码审查 · 排期 · 移动端 · AI 对话
- ✅ **三道门 CI 全绿**：typecheck + 1884 单测（vitest）+ www 静态导出
- 🎨 OKLCH 两层 token + Tailwind v4 preset + ThemeProvider 明暗 0 闪烁 + 运行时换肤

**后续**：组件持续扩量 + 文档站打磨 · Tauri 桌面壳。

设计文档见 `docs/superpowers/specs/`，实施计划见 `docs/superpowers/plans/`，发布指南见 `docs/publishing.md`。
