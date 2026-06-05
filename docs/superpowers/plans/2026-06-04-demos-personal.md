# 个人站 demo + 10 个设计感组件沉淀 —— 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。本计划由主线 orchestrator 派发并行子代理执行，逐组件 review。Steps 用 `- [ ]`。

**Goal:** 从 react-bits/Aceternity/MagicUI 复刻 10 个设计感组件进 `@hulian/ui`（瑚琏化），并搭第 7 个内置 demo `/demos/personal`（独立开发者作品集）把它们用进真实场景。

**Architecture:** 库主线 10 个组件互相独立 → 并行子代理（每个只建自己文件夹 + 测试，**回报**共享文件待加行，不自己改共享文件）；orchestrator 串行收口 4 个共享文件（`src/index.ts`/`src/showcase.ts`/`apps/www/lib/manifest.ts`/`packages/tokens/src/preset.css`）避免并发冲突；demo 主线在库就绪后搭三路由。

**Tech Stack:** React 18 + TS + Tailwind v4 + Base UI + motion + **ogl（新增，WebGL 件懒加载）** + Next.js App Router（output:export）。

参考 spec：`docs/superpowers/specs/2026-06-04-demos-personal-design.md`。

---

## 文件结构图

```
packages/ui/
  package.json                         ← 加 "ogl" 到 dependencies（Phase 0）
  src/
    index.ts                           ← 加 10 行 export *（Phase 2 串行）
    showcase.ts                        ← 加 10 行 export {}Showcase（Phase 2 串行）
    _lib/use-gl-canvas.ts              ← 新建：WebGL 件共享的 SSR/清理/RAF/reduced-motion 帮手（Phase 1 先建）
    aurora/                            ← 5 文件标准件（Phase 1 并行）
    particles/
    flickering-grid/
    wavy-background/
    card-spotlight/
    silk/  iridescence/  threads/  orb/  liquid-chrome/
packages/tokens/src/preset.css         ← 加关键帧 hulian-aurora-bg 等（Phase 2 串行）
apps/www/lib/manifest.ts               ← 加 10 条目（Phase 2 串行）
apps/www/app/demos/lib/demos.ts        ← 加 personal 条目（Phase 3）
apps/www/app/demos/personal/           ← demo 三路由（Phase 3）
```

---

## Phase 0 — ogl 依赖（orchestrator 串行，先做）

- [ ] **Step 1:** `packages/ui/package.json` 的 `dependencies` 加 `"ogl": "^1.0.11"`（按字母位插在 `motion` 之后/`qrcode-generator` 之前；注意 motion 是 peer，ogl 是 dep）。
- [ ] **Step 2:** 仓库根 `pnpm install`（不要在根跑 `pnpm dev`，会误杀 5514，见记忆 `hulian-pnpm-dev-killstale-kills-5514`）。
- [ ] **Step 3:** 验证：`node -e "require.resolve('ogl', {paths:['packages/ui/node_modules','node_modules']})"` 或 `pnpm --filter @hulian/ui exec node -e "import('ogl').then(m=>console.log(Object.keys(m).slice(0,5)))"`，预期打印 `Renderer/Program/...`。

---

## 组件作者契约（10 个组件任务全部继承，逐条照做）

> 每个组件 = `packages/ui/src/<slug>/` 下 5 文件。子代理**只创建自己这个文件夹**，**不碰任何共享文件**，把共享文件待加内容写进返回报告（见末尾「回报格式」）。

### A. 文件骨架（照 Meteors 范式）

`<slug>/index.ts`：
```ts
export { <Name> } from "./<slug>";
export type { <Name>Props } from "./<slug>.types";
```

`<slug>/<slug>.types.ts`：每个 prop 带中文注释 + 默认值说明（照 `meteors.types.ts`）。

`<slug>/<slug>.tsx`：
- 顶部 `"use client";`（canvas/WebGL/鼠标交互件必须；纯 CSS 件若无 hook 可不加并标注 RSC 安全）。
- import `cn` from `"../lib/cn"`。
- **顶部注释标来源 + 瑚琏化说明**，照 Meteors：
  ```
  // 吸取自 react-bits <Name>（github.com/DavidHDev/react-bits）/ Aceternity <name> / magicui <name>。
  // 瑚琏化：① 颜色吃 token（…）② reduced-motion 降级 ③ 关键帧 hulian-… 落 preset.css ④ <其它>。
  ```

`<slug>/<slug>.showcase.tsx`：导出 `<camel>Showcase: ShowcaseSpec`（`import type { ShowcaseSpec } from "../showcase/types"`），含 `states`（≥1 默认态）+ 可选 `controls`/`renderWithProps`/`toCode`。背景类件用一个带 `relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface` 的容器包裹（照 Meteors 的 `Sky`）。

`<slug>/<slug>.test.tsx`：vitest + `@testing-library/react`，≥3 断言：①渲染冒烟（不抛）②关键 prop 生效 ③motion-reduce/fallback 路径。**WebGL 件不在 jsdom 真跑 GL**——断言 fallback 分支渲染、canvas 元素存在、不抛即可（jsdom 无 WebGL context，组件内 try 或能力探测必须容错）。

### B. 瑚琏化硬规则（替换掉来源的写死值）

1. **颜色全部吃 token**：来源里写死的 hex/rgb/tailwind 具体色 → 换成 `currentColor` 或瑚琏语义/chart token（`text-muted`/`bg-surface`/`border-border`/`--color-chart-1..5` 等）。背景渐变色优先用 chart token，可被 `className`/prop 覆盖。
2. **reduced-motion**：所有动画提供 `motion-reduce:` 静态降级，或 JS 读 `window.matchMedia("(prefers-reduced-motion: reduce)")` 渲染静态 `fallback`。
3. **关键帧** 若需 CSS @keyframes → 命名 `hulian-<slug>`（背景极光用 `hulian-aurora-bg` 避撞已有 `hulian-aurora`），**写进返回报告由 orchestrator 落 preset.css**，组件内用 `[animation:hulian-<slug>_...]`。
4. **SSR/hydration 安全**：随机量（粒子位置等）在 `useEffect` 客户端生成，避免 server/client mismatch（照 Meteors）。
5. **className 透传 + 合理默认尺寸**：根元素 `cn("...", className)`；背景类默认 `absolute inset-0 -z-10` 或由文档容器定位。
6. **零 demo-only 依赖进对外面**：showcase 里的 demo 数据不进 `index.ts`。

### C. WebGL 件附加规则（Silk/Iridescence/Threads/Orb/LiquidChrome）

先建共享帮手 `packages/ui/src/_lib/use-gl-canvas.ts`（**由第一个 WebGL 子代理或 orchestrator 先建，其余复用**）：
```ts
"use client";
import { useEffect, useRef, useState } from "react";

/** 懒加载 ogl + 管理 RAF / resize / 离屏暂停 / 卸载销毁 GL context。
 *  setup 回调拿到 { gl, ogl, canvas, width, height }，返回 { render(t), resize(w,h), dispose() }。 */
export function useGlCanvas(
  setup: (ctx: { ogl: typeof import("ogl"); canvas: HTMLCanvasElement }) => Promise<{
    render: (t: number) => void;
    resize?: (w: number, h: number) => void;
    dispose?: () => void;
  }>,
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);
  useEffect(() => {
    if (reduced) return; // 降级：调用方渲染静态 fallback
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0, disposed = false, handle: Awaited<ReturnType<typeof setup>> | null = null;
    let ro: ResizeObserver | null = null, io: IntersectionObserver | null = null, visible = true;
    (async () => {
      const ogl = await import("ogl");
      if (disposed) return;
      handle = await setup({ ogl, canvas });
      if (disposed) { handle.dispose?.(); return; }
      const loop = (t: number) => { if (visible) handle!.render(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      ro = new ResizeObserver(() => {
        const { clientWidth: w, clientHeight: h } = canvas;
        handle!.resize?.(w, h);
      });
      ro.observe(canvas);
      io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true; });
      io.observe(canvas);
    })();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect(); io?.disconnect();
      handle?.dispose?.();
      // 关键：释放 GL context 避免 "too many WebGL contexts" 泄漏
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { ref, reduced };
}
```
- 每个 WebGL 件：`const { ref, reduced } = useGlCanvas(async ({ogl, canvas}) => {...}, [props…])`；`reduced` 为真时渲染 `fallback`（静态渐变 div，吃 chart token）。
- shader 里的颜色 uniform 默认值从 CSS 变量读（`getComputedStyle(canvas).getPropertyValue("--color-chart-1")` 转 rgb），或暴露 `colors?: string[]` prop，默认取瑚琏 chart token。
- **性能**：单页≤1 WebGL（demo 保证）；`useGlCanvas` 已含离屏暂停 + 卸载销毁。

### D. 回报格式（子代理完成后返回给 orchestrator）

```
组件 <Name> 完成。
- 文件夹：packages/ui/src/<slug>/（5 文件已建）
- 测试：pnpm --filter @hulian/ui test <slug> → <PASS, N 用例>
- index.ts 加：export * from "./<slug>";
- showcase.ts 加：export { <camel>Showcase } from "./<slug>/<slug>.showcase";
- manifest.ts 加：{ slug:"<slug>", name:"<Name>", description:"…", category:"decoration", group:"<backdrop|overlay-fx>", tags:[…], status:"new" }
- preset.css 加关键帧：<完整 @keyframes 块，或 "无">
- 备注：<瑚琏化/取舍/坑>
```

---

## Phase 1 — 10 个组件（并行子代理）

> 每个任务的「来源」给子代理起点；子代理用 WebSearch/WebFetch 取真实源码（react-bits: `github.com/DavidHDev/react-bits`，组件在 `src/content/Backgrounds/<Name>/` 或 `src/ts-default/Backgrounds/`；Aceternity: `ui.aceternity.com/components/<name>`；MagicUI: `magicui.design/docs/components/<name>` 或 `github.com/magicuidesign/magicui`）。取不到就按描述自研同等效果，**效果优先**。

### Tier A — 零依赖

#### Task 1: Aurora（极光渐变背景）
- slug `aurora`，Name `Aurora`，category `decoration`/`backdrop`。
- 来源：Aceternity `aurora-background`（CSS 多层 conic/linear 渐变 + mask + 平移动画版，**不要 WebGL 版**）。
- props：`colors?: string[]`（默认瑚琏 chart token）、`blur?: number`、`speed?: number`、`className?`、`children?`（内容覆盖在极光上）。
- 关键帧 `hulian-aurora-bg`（平移渐变背景位置）。reduced-motion 静态。
- demo 用途：主页 Hero 全屏背景。

#### Task 2: Particles（交互粒子场）
- slug `particles`，Name `Particles`，`decoration`/`backdrop`。
- 来源：MagicUI `particles`（canvas，鼠标排斥）。
- props：`quantity?`(默认 100)、`staticity?`、`ease?`、`size?`、`color?`（默认 currentColor→token）、`className?`。
- canvas + DPR 自适应 + 鼠标交互；随机在 effect 生成。reduced-motion 降静态点。
- demo：主页精选作品区背景。

#### Task 3: FlickeringGrid（闪烁网格）
- slug `flickering-grid`，Name `FlickeringGrid`，`decoration`/`backdrop`。
- 来源：MagicUI `flickering-grid`（canvas）。
- props：`squareSize?`、`gridGap?`、`flickerChance?`、`color?`（默认 token）、`maxOpacity?`、`width?`/`height?`、`className?`。
- canvas + ResizeObserver；离屏可停。reduced-motion 降静态低透网格。
- demo：关于区 + 留言板背景（轻）。

#### Task 4: WavyBackground（噪声波浪）
- slug `wavy-background`，Name `WavyBackground`，`decoration`/`backdrop`。
- 来源：Aceternity `wavy-background`。**关键：不要引 `simplex-noise` 包**，内联一个微型 2D 值噪声/simplex（~30 行）保持零依赖。
- props：`colors?: string[]`（默认 chart token）、`waveWidth?`、`backgroundFill?`、`blur?`、`speed?:"slow"|"fast"`、`waveOpacity?`、`className?`、`children?`。
- canvas 多条噪声波浪叠加。reduced-motion 静态波形。
- demo：主页页脚 + 墨册 Inkpad 详情页 hero。

#### Task 5: CardSpotlight（聚光卡片容器）
- slug `card-spotlight`，Name `CardSpotlight`，`decoration`/`overlay-fx`。
- 来源：Aceternity `card-spotlight`（鼠标位置 radial-gradient 高光 + 可选点阵 canvas）。
- props：`radius?`(默认 350)、`color?`（高光色，默认 chart token alpha）、`className?`、`children`。
- `onMouseMove` 更新 CSS 变量 `--hulian-spotlight-x/y`；radial-gradient mask 跟随；surface token 底。motion 已是 peer（用 useMotionValue 或纯 CSS 变量皆可，优先纯 CSS 变量省依赖）。
- demo：精选作品 5 张卡片容器。

### Tier B — WebGL（ogl 懒加载，先建 `_lib/use-gl-canvas.ts`）

> 全部 category `decoration`/`backdrop`，props 至少 `colors?: string[]`（默认 chart token）、`speed?`、`className?`、`fallback?: ReactNode`（reduced-motion/无 WebGL 时渲染，默认静态渐变）。来源均 react-bits（OGL）。

#### Task 6: Silk — 丝绸流动 shader。来源 react-bits `Silk`。props 另含 `scale?`/`noiseIntensity?`/`rotation?`。demo：码尺 Codemarker 详情页 hero。
#### Task 7: Iridescence — 虹彩 shader。来源 react-bits `Iridescence`。props 另含 `amplitude?`/`mouseReact?`。demo：潮汐 Tide 详情页 hero。
#### Task 8: Threads — 流动丝线（鼠标交互）shader。来源 react-bits `Threads`。props 另含 `amplitude?`/`distance?`/`enableMouseInteraction?`。demo：flowctl 详情页 hero。
#### Task 9: Orb — 指针交互发光球 shader。来源 react-bits `Orb`。props 另含 `hue?`/`hoverIntensity?`/`rotateOnHover?`。demo：主页联系/CTA 区焦点。
#### Task 10: LiquidChrome — 液态铬 shader。来源 react-bits `LiquidChrome`。props 另含 `amplitude?`/`frequencyX?`/`frequencyY?`。demo：脉搏 Pulse 详情页 hero。

**每个组件任务的 Steps（统一）：**
- [ ] Step 1: WebFetch 来源源码，读懂结构。
- [ ] Step 2: 建 `<slug>/` 5 文件，按作者契约 A/B(/C) 瑚琏化。
- [ ] Step 3: 写 `<slug>.test.tsx` ≥3 断言（先写预期失败的，再实现）。
- [ ] Step 4: `pnpm --filter @hulian/ui test <slug>` → 绿。
- [ ] Step 5: 不改共享文件，按「回报格式」返回。

---

## Phase 2 — 串行收口共享文件 + 库验证（orchestrator）

- [ ] **Step 1:** 按 10 份回报，编辑 `packages/ui/src/index.ts` 加 10 行 `export * from "./<slug>";`（字母位）。
- [ ] **Step 2:** 编辑 `packages/ui/src/showcase.ts` 加 10 行 `export { <camel>Showcase } from "./<slug>/<slug>.showcase";`（字母位）。
- [ ] **Step 3:** 编辑 `packages/tokens/src/preset.css` 追加各件关键帧（`hulian-aurora-bg` 等），确认无重名。
- [ ] **Step 4:** 编辑 `apps/www/lib/manifest.ts` 加 10 条目（放各自 category/group 区块，参照既有 decoration 区）。
- [ ] **Step 5:** `pnpm --filter @hulian/ui typecheck` → 通过。
- [ ] **Step 6:** `pnpm --filter @hulian/ui test` → 全绿（基线 1278+，新增 ~30+ 用例）。
- [ ] **Step 7:** 若红：用 `turbo-test-red-isolate-untracked-wip-not-your-regression` 思路区分是否他人 WIP 引入，只修自己引入的。

---

## Phase 3 — 个人站 demo 三路由

> 参考已有 demo 范式：`apps/www/app/demos/projects`（详情页 server+generateStaticParams+client 子组件、程序化配图 `_data/photos.ts`）、`crm/_components/crm-shell`（外壳）、共享 `useMockData`/`usePending`/skeleton 基建。

### Task 11: persona 数据 + 程序化配图
- [ ] `personal/_data/profile.ts`：林屿人设、社交链接、技能(Meter 值)、Chip 标签、Timeline 历程。
- [ ] `personal/_data/works.ts`：5 作品（码尺/潮汐/墨册/flowctl/脉搏，各 slug/领域/技术栈/设备类型/详情页背景组件名/截图art/代码片段/安装命令/演示视频 poster）。
- [ ] `personal/_data/art.ts`：照 `projects/_data/photos.ts` 的 `photoArt()` 程序化 SVG（按作品语义配色），零外链。
- [ ] `personal/_data/guestbook.ts`：初始留言种子（含嵌套回复）。

### Task 12: 主页单页 `personal/(site)/page.tsx` + sections
- [ ] 外壳 `_components/site-shell.tsx`：顶栏 + Anchor scrollspy + Affix 吸顶 + Dock 悬浮 + ThemeToggle。
- [ ] sections（各一文件，client）：`hero.tsx`(Aurora+SparklesText/TypingAnimation+WordRotate+AnimatedGradientText+社交Button+Tooltip+AvatarCircles+NumberTicker)、`about.tsx`(Prose+Avatar+FlickeringGrid)、`stack.tsx`(Meter+Chip+Marquee+AnimatedBeam)、`work.tsx`(Particles+CardSpotlight×5+MagicCard/BentoGrid+ShineBorder/GlareHover→Link 详情)、`journey.tsx`(Timeline)、`contact.tsx`(Orb+ProForm+DatePicker+提交toast+CTA)、`footer.tsx`(WavyBackground)。
- [ ] **Anchor 风险**：若主页内层滚动导致 scrollspy 失效（记忆 `scrollspy-anchor-hardcoded-window-scroll`）→ 优先让主页走 window 滚动；必须内层容器则**回 @hulian/ui 给 Anchor 加自定义容器支持**（修组件，不在 demo hack）。

### Task 13: 作品详情 `personal/(site)/work/[slug]/page.tsx`（server）+ client 子组件
- [ ] `generateStaticParams` 导出 5 slug；page 是 server component，交互下沉 client 子组件（记忆 `nextjs-output-export-dynamic-route`）。
- [ ] 子组件：hero banner（按 works.ts 指定背景：Silk/Iridescence/WavyBackground/Threads/LiquidChrome 各一）+ Chip 技术栈 + 外链 Button+Tooltip；Carousel 多图 + Lens 放大；对应设备外壳（Chrome/iPhone/Tablet/Terminal/Watch）裹截图；HeroVideoDialog 演示；Code/Snippet 代码+安装命令；ImageViewer 全屏；上/下一篇。
- [ ] dev 下新增动态路由可能 stale（记忆 `nextjs-16-output-export-hot-added-dynamic-route-stale-missing-param-overlay`）→ 需要时重启 dev / 清 .next。

### Task 14: 留言板 `personal/(site)/guestbook/page.tsx`（交互生命周期主场）
- [ ] `useMockData` 异步加载 → Skeleton(≥300ms)；可模拟失败 → Alert/Result+重试；空 → Empty。
- [ ] 写：MarkdownEditor + 昵称 input(Field) + Rating；提交校验→toast→乐观插入 Comment(嵌套)；删自己→Popconfirm→toast。AvatarCircles 最近访客。FlickeringGrid 背景。

**铁律二自检**：Skeleton/Empty/Alert+重试/toast(增删改+Snippet复制)/Popconfirm/纯图标全 Tooltip 逐条过。

---

## Phase 4 — 注册 + 验证（orchestrator）

### Task 15: 注册 demo
- [ ] `apps/www/app/demos/lib/demos.ts` 加 `{ slug:"personal", title:"独立开发者个人站 / 作品集", description:"…", href:"/demos/personal", category:"个人站", status:"done", tags:["Aurora","Silk","CardSpotlight","Dock"] }`。

### Task 16: 门禁 + 构建 + 实机
- [ ] `node apps/www/scripts/demos-coverage.mjs`：外链=0；覆盖率较 54% 提升（10 新件 + 现有盲区被命中）。
- [ ] `pnpm --filter www build`（output:export）通过；`work/[slug]` 静态导出 5 页无误（隔离 distDir 若 next lock 争用，见记忆 `nextjs-build-verify-isolated-distdir`）。
- [ ] 实机像素自证：起 `pnpm --filter www dev`（**不要根 pnpm dev**），用隔离 Chrome-for-Testing（记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）+ WebGL 软渲 `--enable-unsafe-swiftshader`，CDP 截图：主页 6 区 + 5 详情页（验各自背景）+ 留言板 3 态 + 暗色。注意 www headless 可能空白（记忆 `www-msw-gate-blanks-headless-screenshots`）→ 真实浏览器/Playwright MCP 兜底。
- [ ] 零 console error（WebGL warning 容忍，error 不容忍）。

### Task 17: 收尾
- [ ] 更新 MEMORY.md 阶段进度 + 写本批组件/demo 记忆。
- [ ] 不自动 commit（工作树有他人 WIP）；汇总变更通知用户，问是否 commit。

---

## 自检（plan vs spec）

- **覆盖**：spec §1.1/§1.2 十组件 = Phase1 Task1-10 ✓；§1.3 接入清单 = 作者契约 A + Phase2 ✓；§2 demo 三路由 = Phase3 Task11-14 ✓；§2.6 铁律二 = Task14 自检 ✓；§2.7 注册 = Task15 ✓；§4 验证 = Phase4 ✓；§5 风险（Anchor/WebGL context/SSR/并发共享文件/ogl 包体/堆砌）均有对应 Step ✓。
- **类型一致**：`useGlCanvas` 签名在 C 定义，Task6-10 引用一致；回报格式字段与 Phase2 收口步骤字段对齐 ✓。
- **无占位**：源码细节交由子代理 WebFetch 真实来源（外部库源码即事实，不在计划里臆造 shader）；接入骨架/帮手/测试范式均给了完整代码 ✓。
- **并发安全**：子代理只建独立文件夹、不碰共享文件，orchestrator 串行收口——规避 `parallel-session-git-add-all-sweeps` 类冲突 ✓。
