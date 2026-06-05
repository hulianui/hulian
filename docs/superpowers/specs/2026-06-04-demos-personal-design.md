# 个人站 demo + 设计感组件批量沉淀 —— 设计文档

> 日期：2026-06-04 ｜ 状态：设计已确认，待 writing-plans
> 配套铁律：`apps/www/app/demos/README.md`（demo 四铁律）；记忆 `fix-component-not-demo-css-patch`、`hulian-output-export-dynamic-route`、`scrollspy-anchor-hardcoded-window-scroll`、`www-msw-gate-blanks-headless-screenshots`、`mcp-browser-busy-launch-isolated-chromium-via-executablepath`。

## 0. 纲领（用户定调）

> **「我做 demo 的意义就是寻求真实场景，然后拓展 UI 库。」**
> **「自家 UI 库就是要够全，省得用户到处 import 别人的库。」**

所以本任务的**真正交付物是更全的 `@hulian/ui`**，个人站 demo 是「寻找真实场景 → 暴露库缺口 → 沉淀组件」的载体。两条主线：

1. **库主线（重点）**：从 GitHub（react-bits / Aceternity / MagicUI）复刻 **10 个设计感组件**进 `@hulian/ui`，瑚琏化（吃 token、reduced-motion、SSR 安全、关键帧 `hulian-` 前缀、来源标注）。
2. **demo 主线**：第 7 个内置 demo `/demos/personal`（独立开发者作品集），把这批新组件 + 大量现有盲区组件塞进真实场景，并走完整交互生命周期。

## 1. 库主线：10 个新组件

### 1.1 Tier A — 零依赖（canvas / CSS）

| 组件 | slug / category·group | 复刻来源 | 一句话 | 瑚琏化要点 |
|---|---|---|---|---|
| **Aurora** | `aurora` · decoration/backdrop | Aceternity `aurora-background`（CSS 渐变版） | 极光丝带流动背景 | 渐变停靠色用 chart token；新关键帧 `hulian-aurora-bg`（避撞已有 `hulian-aurora`/AuroraText）；reduced-motion 静态 |
| **Particles** | `particles` · decoration/backdrop | react-bits `Particles` 思路 + MagicUI canvas | 交互粒子场（鼠标排斥/连线） | 粒子色 currentColor/token；client-only canvas；DPR 自适应；reduced-motion 降静态点 |
| **FlickeringGrid** | `flickering-grid` · decoration/backdrop | MagicUI `flickering-grid` | 随机闪烁方格网 | 方格色 token；ResizeObserver 自适应；IntersectionObserver 离屏停 |
| **WavyBackground** | `wavy-background` · decoration/backdrop | Aceternity `wavy-background` | 噪声驱动波浪带 | **内联微型 simplex noise**（不引 simplex-noise 包，保零依赖）；波浪色 chart token |
| **CardSpotlight** | `card-spotlight` · decoration/overlay-fx | Aceternity `card-spotlight` | 鼠标跟随径向聚光卡片容器 | motion 追踪指针 + radial-gradient mask + 可选点阵 canvas；surface token；motion 已是 peer |

### 1.2 Tier B — WebGL（`ogl`，懒加载）

| 组件 | slug · category·group | 复刻来源（react-bits） | 一句话 |
|---|---|---|---|
| **Silk** | `silk` · decoration/backdrop | `Silk` (OGL) | 丝绸流动 shader |
| **Iridescence** | `iridescence` · decoration/backdrop | `Iridescence` (OGL) | 虹彩流动 shader |
| **Threads** | `threads` · decoration/backdrop | `Threads` (OGL) | 流动丝线（鼠标交互）shader |
| **Orb** | `orb` · decoration/backdrop | `Orb` (OGL) | 指针交互发光球 shader |
| **LiquidChrome** | `liquid-chrome` · decoration/backdrop | `LiquidChrome` (OGL) | 液态铬金属 shader |

#### ogl 依赖策略（架构决策，用户已拍板「加，自家库要全」）

- `ogl`（~30KB，tree-shakeable）加入 `packages/ui/package.json` 的 `dependencies`。
- **每个 WebGL 组件懒加载**：`const { Renderer, Program, ... } = await import("ogl")`，放在 `useEffect` 内 → 代码分割、SSR/RSC 安全（`"use client"` + canvas ref，effect 仅客户端跑）、不用 WebGL 的用户零成本。
- **统一 SSR / 降级 / 清理范式**（抽一个内部 `use-gl-canvas` 帮手或每件复用同模板）：
  - reduced-motion 或无 WebGL → 渲染 `fallback`（静态渐变，吃 token）。
  - **卸载必 `renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()` + cancelAnimationFrame**，杜绝「too many WebGL contexts」泄漏。
  - IntersectionObserver 离屏暂停 RAF（多详情页/画廊场景必需）。
- **硬约束**：同一页面同时可见 WebGL canvas ≤ 1（浏览器 GL context 上限 + 性能）。demo 里靠「一页一个」保证（见 §2.4）。

### 1.3 每个组件的接入清单（端到端，逐件照做）

1. `packages/ui/src/<slug>/` 标准 5 文件：`<name>.tsx`、`<name>.types.ts`、`<name>.showcase.tsx`、`<name>.test.tsx`、`index.ts`（仅导出组件+类型，**不导 showcase**）。
2. `packages/ui/src/index.ts` 加 `export * from "./<slug>";`（按字母位）。
3. `packages/ui/src/showcase.ts` 加 `export { <camel>Showcase } from "./<slug>/<slug>.showcase";`（手维护聚合）。
4. `apps/www/lib/manifest.ts` 加 `{ slug, name, description, category, group, tags:[...], status:"new" }` 条目。
5. 动画类关键帧落 `packages/tokens/src/preset.css`，`hulian-` 前缀。
6. `<name>.test.tsx`：渲染冒烟 + 关键 prop + reduced-motion 降级路径（WebGL 件 mock `import("ogl")` 或断言 fallback 分支，不在 jsdom 真跑 GL）。
7. 注释顶部标注来源（照 `meteors.tsx` 范式：「吸取自 react-bits `Silk`…；瑚琏化：…」），保留来源版权语义。

### 1.4 验收（库主线）

- `pnpm --filter @hulian/ui test` 全绿（新增件各自测试通过）。
- `pnpm --filter @hulian/ui typecheck` 通过。
- 文档站画廊每个新 slug 页可渲染、无 console error（WebGL 件需真实浏览器 + GPU/swiftshader，见 §4）。
- `demos:coverage` 分母 +10，且这 10 件在 demo 主线被覆盖（见 §2.4 映射）。

## 2. demo 主线：`/demos/personal` 独立开发者作品集

### 2.1 人设与内容（全中文、零外链）

- **林屿（Lin Yu）**，独立全栈 + 独立产品作者，「做能自己用的东西」。handle `@linyu`。
- 配图/海报**程序化生成 SVG**（照 `projects/_data/photos.ts` 的 `photoArt()` 按语义配色）；头像用 `Avatar` fallback 或 `public/demo/avatar-*`；演示视频用本地 `public/` 或 poster-only。**零外链**（铁律四，`demos:coverage` 强制）。

### 2.2 路由（output: export 兼容）

```
/demos/personal               主页单页滚动（server page + client sections）
/demos/personal/work/[slug]   作品详情（generateStaticParams + server page 拆 client 子组件）
/demos/personal/guestbook     留言板（交互生命周期主场）
```

`[slug]` 静态导出：照记忆 `hulian-output-export-dynamic-route` —— `generateStaticParams` 导出全部 slug，页面是 server component，交互下沉到 client 子组件。

### 2.3 主页 sections（Anchor scrollspy + Affix 吸顶 + Dock 悬浮导航 串联）

| 区块 | 组件（**粗体=新沉淀件**，其余=现有盲区/已用件） |
|---|---|
| **Hero** | **Aurora**（全屏背景）· SparklesText/TypingAnimation（名字）· WordRotate（全栈/产品作者轮换）· AnimatedGradientText（标语）· 社交链接 Button+Tooltip · AvatarCircles（订阅者）· NumberTicker（star/下载数） |
| **关于 About** | Prose（长文自述）· Avatar · **FlickeringGrid**（subtle 背景） |
| **技能栈 Stack** | Meter（熟练度）· Chip（技术标签）· Marquee（工具）· AnimatedBeam（连「我」→领域） |
| **精选作品 Work** | **CardSpotlight** 包裹 5 张作品卡 · MagicCard/BentoGrid 布局 · ShineBorder/GlareHover · **Particles**（区背景）→ 点进详情 |
| **历程 Journey** | Timeline（复用） |
| **联系 / CTA** | **Orb**（交互焦点）· ProForm（邮箱/留言）· DatePicker（约 1:1）· 提交 toast · CTA→留言板 |
| **页脚 Footer** | **WavyBackground** |

导航：**Anchor**（scrollspy 滑动指示条）+ **Affix**（吸顶）+ **Dock**（macOS 式悬浮，社交/回顶）。

### 2.4 作品详情 `/work/[slug]` —— 5 作品 × 5 设备 × 5 高级背景

每个作品详情页 hero banner 用**不同**的高级背景（天然分散、非堆砌，一页一个 WebGL 满足 §1.2 性能约束）：

| 作品 | 领域 / 技术栈 | 设备外壳 | 详情页 hero 背景 |
|---|---|---|---|
| 码尺 Codemarker | 代码截图美化网页工具 · React/TS/Vite | **Chrome** | **Silk** |
| 潮汐 Tide | 专注计时 APP · Swift/SwiftUI | **iPhone** | **Iridescence** |
| 墨册 Inkpad | 本地优先 MD 笔记 · Tauri/Rust/React | **Tablet** | **WavyBackground** |
| flowctl | 开源 CLI 工作流 · Rust/Go | **Terminal**（逐行揭示） | **Threads** |
| 脉搏 Pulse | Apple Watch 健康微件 · Swift/WidgetKit | **Watch** | **LiquidChrome** |

详情页统一含：Carousel 多图轮播 + Lens 放大 · 对应设备外壳裹截图 · HeroVideoDialog 演示视频 · Code/Snippet 关键代码+安装命令 · ImageViewer 全屏看图（复用）· Chip 技术栈 · 上/下一篇。

> 这样 10 个新件全部在 demo 真实出场：Aurora/FlickeringGrid/Particles/Orb/WavyBackground 在主页；Silk/Iridescence/Threads/LiquidChrome（+WavyBackground 复用）在 5 个详情页；CardSpotlight 在作品卡。

### 2.5 留言板 `/guestbook` —— 铁律二完整交互链主场

```
加载 Skeleton(≥300ms, useMockData 异步)
  → 失败 Alert/Result + 重试  /  空 Empty
    → MarkdownEditor 写留言 + 昵称 input + Rating 打分
      → 提交校验 → toast 成功 → 乐观插入 Comment 列表（嵌套回复）
        → 删自己留言 Popconfirm 二次确认 → toast
```
AvatarCircles 显示最近访客。背景用 FlickeringGrid（轻）。

### 2.6 交互态落点（验收 checklist · 铁律二）

- Skeleton：作品区 + 留言板首屏（≥300ms 肉眼可见）。
- Empty / Alert+重试：留言板（无结果 + 模拟加载失败）。
- toast：留言提交/删除、联系表单提交、Snippet 复制，零静默。
- Popconfirm：删留言。
- Tooltip：所有纯图标按钮（社交、Dock 项、详情页操作）。

### 2.7 注册 demo

`apps/www/app/demos/lib/demos.ts` 加条目：`slug:"personal"`，`category:"个人站"`（新类目），`status:"done"`，tags 选代表性新件（如 `["Aurora","Silk","CardSpotlight","Dock"]`）。

## 3. 实现策略

- 库主线 10 个组件相互独立 → 适合**并行 agent 派发**（writing-plans 阶段决定；每件一个 worktree 或共享但分文件，避免 §barrel 文件并发冲突——`src/index.ts`/`showcase.ts`/`manifest.ts`/`preset.css` 是共享热点，用 **hunk 级 git apply 或串行收口**，照记忆并发经验）。
- demo 主线依赖库主线产出 → 组件就绪后搭页面。
- 共享 mock 基建复用 `useMockData`/`usePending`/skeletons（已存在）。

## 4. 验证（铁律 + 记忆约束）

- **WebGL 件实机**：headless 默认无 GPU → 用隔离 Chrome-for-Testing + `--enable-unsafe-swiftshader`（软件 WebGL），或带 GPU 的真实浏览器；照记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath` 起独立 chromium，避 MCP 争用。
- **www 截图坑**：记忆 `www-msw-gate-blanks-headless-screenshots` —— dev 下 headless CLI 截图可能全空白；视觉自证走真实浏览器 / Playwright MCP / CDP / curl SSR HTML。
- `pnpm --filter @hulian/ui test` + `typecheck` 全绿。
- `pnpm --filter www build`（output:export）通过，`[slug]` 静态导出无误。
- `node apps/www/scripts/demos-coverage.mjs`：外链=0；覆盖率较 53% 显著提升（10 新件 + 大量现有盲区被 demo 命中）。
- 实机逐页像素自证：主页 6 区 + 5 详情页（各自背景）+ 留言板 3 态（加载/空或错/已写）+ 暗色模式。

## 5. 风险与预案

| 风险 | 预案 |
|---|---|
| **Anchor scrollspy** 只认 window scroll，主页若内层滚动失效 | 记忆 `scrollspy-anchor-hardcoded-window-scroll`；优先让主页用 window 滚动；若必须内层容器→**回 @hulian/ui 给 Anchor 加自定义容器支持**（修组件，不在 demo hack） |
| 多 WebGL 同屏 → context 超限/掉帧 | §1.2 一页≤1；IntersectionObserver 离屏停；卸载 loseContext |
| WebGL SSR/hydration mismatch | `"use client"` + 仅 effect 内建 GL；首帧 fallback；随机量在 effect 生成（照 Meteors 范式） |
| reduced-motion / 无障碍 | 每个动效件提供静态 fallback + `prefers-reduced-motion` 分支 |
| 共享 barrel 文件并发冲突 | hunk 级 git apply / 串行收口 index.ts·showcase.ts·manifest.ts·preset.css |
| ogl 引入影响非 WebGL 用户包体 | 懒 `import("ogl")` 代码分割；base bundle 不含 |
| demo 堆砌（铁律三） | 一页一背景、组件只进「真实产品会用」的位置；库全量进画廊，demo 用合身子集 |

## 6. YAGNI / 不做

- 不做真实后端 / 真登录（mock 内存态）。
- 不引 three.js / postprocessing（react-bits 里依赖这些的件如 Hyperspeed/Ballpit 本批不收，统一 ogl 一条依赖线）。
- 不做博客全文 CMS（个人站定位作品集，非博客；博客是另一个 demo 的事）。
- 暂不收 Galaxy/Balatro/Dither 等需额外 postprocessing 的 react-bits 件（后续批次再议）。
