# 瑚琏 Hulian — MagicUI 零依赖批次合集设计（文字动画 / 特效按钮 / 特效核心 / 设备外壳）

- **日期**: 2026-06-03
- **状态**: 自主推进（用户 goal「继续 全部做完再通知我」）—— 把 MagicUI 缺口对照里**不需新增第三方依赖**的批次一次性做完。设计裁决按本 spec 合理默认并文档化，收尾统一通知。
- **覆盖范围**: 4 批 **18 件**（全部源自 magicui.design，全部纯 CSS/SVG 或复用已装的 motion/react，**零新 npm 依赖**）。
  - **批 2 文字动画(6)**: AuroraText · AnimatedShinyText · AnimatedGradientText · WordRotate · TypingAnimation · SparklesText
  - **批 3 特效按钮(4)**: ShimmerButton · RainbowButton · PulsatingButton · RippleButton
  - **批 4 特效核心(5)**: BorderBeam · ShineBorder · Meteors · MagicCard · GlareHover
  - **批 5 设备外壳(3)**: Safari · iPhone · Android（新增 `mockups` 分类）
- **上游依据**: `2026-06-03-hulian-magicui-gap-analysis.md`（P1/P2 roadmap）、`2026-06-03-hulian-effects-backgrounds-design.md`（effects 吸取范式）、记忆 `hulian-phase-status`。
- **效率裁决**: 4 批共享同一吸取范式 → 合写一份 spec + 一份 plan，但**实现按批各自 commit**（守成本 Rule 单批可独立验收）。源码已用 github MCP 取 magicui `apps/www/registry/magicui/*.tsx` verbatim 比对（非凭记忆）。

---

## 1. 全合集共性范式（延续 effects 背景批）

1. **颜色走瑚琏 token，不写死 magicui 的 hex**：magicui 默认 `#ffaa40`/`#9c40ff`/`zinc-500` 等 → 瑚琏改默认 `var(--color-primary)` / `var(--color-chart-1..4)` / `currentColor`，自动吃明暗主题。彩色渐变类默认用 chart 调色板。
2. **动画件关键帧落 `@hulianui/tokens preset.css`**（CSS 侧动效 SSOT，统一 `hulian-` 前缀），不散落组件内。
3. **`motion-reduce:[animation:none]` / `useReducedMotion()` 恒挂**（纯 CSS 件用 Tailwind 变体；motion 件用 hook）。
4. **RSC 优先**：纯 CSS/SVG 件不加 `"use client"`（AuroraText/AnimatedShinyText/AnimatedGradientText/ShimmerButton/RainbowButton/PulsatingButton/ShineBorder/GlareHover/Safari/iPhone/Android）；用 motion/useState/useEffect 的件必 `"use client"`（WordRotate/TypingAnimation/SparklesText/Meteors/BorderBeam/MagicCard/RippleButton）。
5. **API 瑚琏化统一**：`...props` 透传、`cn()` 合并 className、四件套 + 桶 + 主 barrel + manifest + registry。
6. **YAGNI 简化 magicui 过度参数**：如 TypingAnimation 的多词删除状态机 / cursorStyle 三态 → 瑚琏只做单串打字 + 闪烁光标；保留高频 prop，砍冷门。

## 2. preset.css 新增关键帧（统一前缀，本合集一次性加）

```css
@keyframes hulian-aurora { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes hulian-shiny-text { 0%,90%,100%{background-position:calc(-100% - var(--hulian-shiny-width,100px)) 0} 30%,60%{background-position:calc(100% + var(--hulian-shiny-width,100px)) 0} }
@keyframes hulian-shimmer-slide { to{transform:translate(calc(100cqw - 100%),0)} }
@keyframes hulian-spin-around { 0%{transform:translateZ(0) rotate(0)} 15%,35%{transform:translateZ(0) rotate(90deg)} 65%,85%{transform:translateZ(0) rotate(270deg)} 100%{transform:translateZ(0) rotate(360deg)} }
@keyframes hulian-meteor { 0%{transform:rotate(var(--hulian-meteor-angle,215deg)) translateX(0);opacity:1} 70%{opacity:1} 100%{transform:rotate(var(--hulian-meteor-angle,215deg)) translateX(-500px);opacity:0} }
@keyframes hulian-blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes hulian-rainbow { 0%{background-position:0%} 100%{background-position:200%} }
@keyframes hulian-pulse-ring { 0%{box-shadow:0 0 0 0 var(--hulian-pulse-color,color-mix(in srgb,var(--color-primary) 70%,transparent))} 70%{box-shadow:0 0 0 var(--hulian-pulse-size,8px) transparent} 100%{box-shadow:0 0 0 0 transparent} }
@keyframes hulian-shine-border { 0%{background-position:0% 0%} 50%{background-position:100% 100%} 100%{background-position:0% 0%} }
@keyframes hulian-button-ripple { to{transform:scale(4);opacity:0} }
```

## 3. 逐批裁决要点

### 批 2 文字动画
- **AuroraText**（纯 CSS·RSC）：`<span>` 双层（`sr-only` 真文本给 AT + `aria-hidden` 渐变层）；渐变层 `bg-clip-text text-transparent [background-size:200%] [animation:hulian-aurora]`，`backgroundImage: linear-gradient(135deg, <colors join>, <colors[0]>)`。默认 colors = 4 个 chart token。`speed` 控时长。
- **AnimatedShinyText**（纯 CSS·RSC）：muted 文本上扫一道高光。`bg-clip-text` + `[background-size:var(--hulian-shiny-width)_100%]` + `[animation:hulian-shiny-text_Xs_linear_infinite]`；高光渐变 `via-foreground/80`（瑚琏 token，替 magicui 的 black/white 双写）。
- **AnimatedGradientText**（纯 CSS·RSC）：包裹 children 的渐变流动文本（badge 气质，常用于「✨ Introducing」）。`bg-clip-text text-transparent` + chart 渐变 + `[animation:hulian-aurora]`（复用 aurora 关键帧，bg-size 200%）。与 Aurora 区别：Aurora 是标题级大字单色流光、AnimatedGradientText 是行内徽标级 + 可选边框光。
- **WordRotate**（motion·client）：`AnimatePresence mode=wait` 轮换 `words[]`，`useState`+`setInterval(duration)`；进出场 y 位移淡入淡出。`useReducedMotion` → 直接切词不动画。
- **TypingAnimation**（motion/state·client）：**瑚琏简化版**——单 `text` 字符串逐字打字（`useState` charIndex + `setInterval`），`startOnView`（`useInView once`）触发，末尾闪烁光标（`[animation:hulian-blink]`）。砍 magicui 的多词删除/三 cursorStyle（YAGNI）。`useReducedMotion` → 直接显全文。
- **SparklesText**（motion·client）：children 文本 + 周围随机生成的小星 SVG（`useState`+`useEffect` 客户端生成位置避 hydration mismatch，每颗 motion 缩放/透明脉冲）。star 颜色默认 `var(--color-primary)`+`var(--color-chart-1)`。`useReducedMotion` → 不生成星。

### 批 3 特效按钮
- **ShimmerButton**（纯 CSS·RSC）：magicui 范式——button `overflow-hidden` 内嵌 spark 容器（`@container` + `[animation:hulian-shimmer-slide]`）+ spark before（`conic-gradient` + `[animation:hulian-spin-around]`）+ highlight inset shadow + backdrop。瑚琏化：`--bg` 默认 `var(--color-primary)`、文字 `text-primary-foreground`、shimmer 色默认 `var(--color-primary-foreground)`、`--radius` 复用 token。
- **RainbowButton**（纯 CSS·RSC）：按钮底部彩虹流光（`[animation:hulian-rainbow]` 平移 `background-size:200%` 的多色 linear-gradient）。瑚琏化：彩虹用 chart-1..4 token（非写死 hsl）。
- **PulsatingButton**（纯 CSS·RSC）：`[animation:hulian-pulse-ring]` 外扩光环（box-shadow）。`pulseColor` 默认 `var(--color-primary)`，`duration`/`size` 走变量。
- **RippleButton**（motion/state·client）：点击在落点生成扩散波纹（`useState` ripples 数组 + `[animation:hulian-button-ripple]` scale+fade，动画结束移除）。波纹色 `currentColor`。

### 批 4 特效核心
- **BorderBeam**（motion·client）：magicui verbatim 范式——绝对定位 `inset-0 rounded-[inherit]` 容器 + mask（`mask-clip:padding-box,border-box` + `mask-intersect` 只露边框）+ `motion.div` 沿 `offsetPath: rect(0 auto auto 0 round size)` 动 `offsetDistance 0→100%`。mask 用**内联 style 组合**（不依赖 TW v4 新 mask 工具类的可用性，确定性更高）。beam 渐变 `from var(--color-primary) via var(--color-chart-2) to transparent`。`reverse`/`duration`/`size`/`borderWidth` 透传。
- **ShineBorder**（纯 CSS·RSC）：边框流光——`mask` 掏空中心只留边框，边框 `background: radial/linear chart 渐变` + `[animation:hulian-shine-border]` 平移。`borderWidth`/`duration`/`shineColor[]` props。
- **Meteors**（client·random）：magicui 范式——`useState`+`useEffect` 客户端生成 N 颗流星（随机 left/delay/duration，避 SSR mismatch），每颗 `[animation:hulian-meteor]` 斜向下落 + 拖尾。瑚琏化：流星头/尾用 `currentColor`（根 `text-muted`）替 zinc-500。`--hulian-meteor-angle` 变量。
- **MagicCard**（motion·client）：鼠标跟随的径向高光卡片——`useMotionValue` 存 mouse x/y，`useMotionTemplate` 生成 `radial-gradient(...at mouseX mouseY...)` 覆盖层。高光色默认 `var(--color-primary)` 低透明。`gradientSize`/`gradientColor`/`gradientOpacity` props。
- **GlareHover**（纯 CSS·RSC）：悬停时一道反光斜扫过（`::before` 或子层 `linear-gradient` 高光 + hover 时 transform translateX，`transition`）。纯 CSS hover 不需 JS。

### 批 5 设备外壳（新增 `mockups` 分类）
- **不照 magicui 的巨型硬编码 SVG**，改 **hulian 风格 CSS 框**（token 驱动、更轻、可塞任意 children/图片）：
- **Safari**（纯 CSS·RSC）：浏览器窗口 chrome——顶栏 `bg-surface border-b` + 三个 traffic-light 圆点 + 居中 url 胶囊（显 `url` prop）+ 下方 content 区（children 或 `imageSrc`）。整体 `rounded-xl border shadow`.
- **iPhone**（纯 CSS·RSC）：手机框——圆角粗边框 `rounded-[2.5rem] border-[8px] border-foreground`（暗态自动反），顶部灵动岛/刘海 pill，content 区（children/imageSrc）。`width` prop。
- **Android**（纯 CSS·RSC）：类似 iPhone 但居中打孔摄像头（顶部小圆点）+ 细一点边框 + 直角少一点圆角，区分 iOS 视觉语言。

## 4. 接线 & 分类
- `mockups` 为**新增第 6 个 CategoryKey**（label「设备外壳」）→ 改 `manifest.ts` 的 `CategoryKey` 联合类型 + `CATEGORIES` 数组（批 5 才动）。其余 15 件归 `effects`（文字/按钮/特效）。
- 每批：barrel ×N + manifest ×N + registry ×N + preset.css 关键帧（批 2/3/4 各需）。

## 5. 明确延后（不在本合集·守确认过的依赖策略）
需新增第三方库或低价值，**标注延后**：Globe(cobe) · Particles/IconCloud(canvas) · Confetti(canvas-confetti) · SmoothCursor/Pointer(全局光标·侵入式) · TweetCard(外部数据) · Terminal/Dock/OrbitingCircles/Lens(P2 后续可纯 CSS 但本轮先收口) · Globe 等。收尾在缺口对照文档回写「本轮已落 / 仍延后」。

## 6. 测试 & 验证
- 每件 ≥4 TDD 用例（结构/类/CSS 变量/reduced-motion/透传，对齐 effects 批粒度）；动画时序/视觉交隔离 chromium 截图（每批边界截一轮）。
- 三道门：`pnpm --filter @hulianui/ui test` + ui/www typecheck（build --filter=www 视情况）。
