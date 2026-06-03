# 瑚琏 Hulian — MagicUI 全目录 → `effects` 分类缺口对照

- **日期**: 2026-06-03
- **状态**: 缺口分析 / roadmap。原为纯对照，**后续已按 roadmap 落地多批**（见文末「落地进度」回写）。
- **落地进度（2026-06-03 回写）**:
  - ✅ **背景批 ×5**（commit `5af4bb8`）：DotPattern/GridPattern/RetroGrid/Ripple/StripedPattern
  - ✅ **零依赖合集 ×18**（commit `281f513`）：文字动画 6(AuroraText/AnimatedShinyText/AnimatedGradientText/WordRotate/TypingAnimation/SparklesText) + 特效按钮 4(Shimmer/Rainbow/Pulsating/Ripple Button) + 特效核心 5(BorderBeam/ShineBorder/Meteors/MagicCard/GlareHover) + 设备外壳 3(Safari/iPhone/Android，新增 `mockups` 分类)
  - **effects 分类累计 22 件 + mockups 3 件**。
  - ⏳ **仍延后（需新增第三方依赖或低价值，守确认过的依赖策略）**: Globe(cobe) · Particles/IconCloud(canvas) · Confetti(canvas-confetti) · SmoothCursor/Pointer(全局光标侵入式) · TweetCard(外部数据) · Terminal/Dock/OrbitingCircles/Lens/AvatarCircles/HeroVideoDialog(P2 可纯 CSS 后续可补) · Blur Fade/Text Reveal/Hyper Text/Number Ticker(已落) 等其余文字动画(可增量)。
- **依赖策略裁决**（用户已确认）: **沿用现有 `motion/react`**。MagicUI 文字/列表/位移动画类直接复用 motion（NumberTicker 已在用，A1 已装）；纯 CSS/SVG 能实现的优先纯实现（同 Marquee 范式，零运行时）；需 `cobe`/`three`/`canvas-confetti` 等重三方库的组件**标注但本阶段不强制引入**，逐件评估。
- **上游依据**:
  - `2026-06-03-hulian-a2-4-effects-number-ticker-marquee-design.md`（`effects` 分类起步：吸取模式 = 抄实现骨架 + 换瑚琏 token + 统一 API + 复用 `packages/ui/src/motion`，**不新增 npm 依赖**）
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 `effects`：shimmer・marquee・beam・number-ticker；§10「`magic` = magicui.design，copy-paste 模式」）
  - 项目记忆 `hulian-phase-status`

---

## 1. 对照口径说明（重要）

MagicUI（magicui.design）是 **动效/特效组件库**——Marquee、文字动画、特效背景、设备外壳这类「表现层」组件。它与 hulian 已实现的 **标准组件**（Button / Card / Select / Table / Dialog…）是**两个不同维度**，不构成竞品替代关系。

因此本对照**只在 hulian 的 `effects`「动效」分类这一层做**，不把 MagicUI 的 `Button`（特效按钮）去顶替 hulian 已有的标准 `Button`——而是作为 hulian Button 的**特效变体**或独立特效件归入 `effects`。

- **MagicUI 全目录约 75 件**（含 community 区）
- **hulian `effects` 已落 2 件**：`Marquee`、`NumberTicker`
- **缺口约 73 件**

---

## 2. 全目录对照表

图例：✅ 已实现 ｜ ⬜ 缺失 ｜ 🔌 需重三方依赖（本阶段标注不强制做）

### 2.1 Components（基础特效组件）

| MagicUI | 状态 | hulian 归属 | 依赖 | 备注 |
|---|---|---|---|---|
| Marquee | ✅ | effects | 纯 CSS | 已落，零运行时 |
| Number Ticker | ✅ | effects | motion/react | 已落 |
| Terminal | ⬜ | effects | motion | 打字机式终端框，可复用 Typing 逻辑 |
| Bento Grid | ⬜ | layout | 纯 CSS | 栅格布局容器，无动画核心 |
| Animated List | ⬜ | effects | motion | 列表逐项入场 |
| Dock | ⬜ | navigation / effects | motion | macOS 式放大坞 |
| Globe | ⬜ | effects | 🔌 cobe | WebGL 地球 |
| Orbiting Circles | ⬜ | effects | 纯 CSS/SVG | 轨道环绕 |
| Avatar Circles | ⬜ | data-display | 纯 CSS | 扩 Avatar（堆叠头像组） |
| Icon Cloud | ⬜ | effects | 🔌 canvas | 3D 图标云 |
| Lens | ⬜ | interaction | motion | 放大镜悬停 |
| Pointer | ⬜ | interaction | motion | 自定义指针 |
| Smooth Cursor | ⬜ | interaction | motion | 平滑跟随光标 |
| Progressive Blur | ⬜ | effects | 纯 CSS | 渐进模糊遮罩 |
| Hero Video Dialog | ⬜ | overlay | motion | 扩 Dialog（视频弹层） |
| Tweet Card | ⬜ | — | 三方数据 | 社区向，优先级低 |
| Dotted Map | ⬜ | effects | SVG | 点阵地图 |

### 2.2 Special Effects

| MagicUI | 状态 | hulian 归属 | 依赖 | 备注 |
|---|---|---|---|---|
| Animated Beam | ⬜ | effects | motion + SVG | absorption §3.4 已点名 `beam` |
| Border Beam | ⬜ | effects | 纯 CSS | 边框流光 |
| Shine Border | ⬜ | effects | 纯 CSS | 边框微光 |
| Magic Card | ⬜ | effects | motion | 鼠标跟随光晕卡片 |
| Glare Hover | ⬜ | effects | 纯 CSS | 悬停反光 |
| Meteors | ⬜ | effects | 纯 CSS | 流星背景 |
| Confetti | ⬜ | effects | 🔌 canvas-confetti | 彩纸礼花 |
| Particles | ⬜ | effects | 🔌 canvas | 粒子背景 |
| Animated Theme Toggler | ⬜ | effects | View Transitions | 主题切换动效（hulian 已有 ThemeProvider 可接） |

### 2.3 Text Animations（文字动画，全缺 18）

全部归 `effects`（建议 `effects/text` 子组），运行时多为 motion/react，少数纯 CSS。

| MagicUI | 依赖 | | MagicUI | 依赖 |
|---|---|---|---|---|
| Blur Fade | motion | | Word Rotate | motion |
| Text Animate | motion | | Sparkles Text | 纯 CSS/SVG |
| Typing Animation | motion | | Morphing Text | 纯 CSS |
| Aurora Text | 纯 CSS | | Spinning Text | 纯 CSS |
| Animated Shiny Text | 纯 CSS | | Text Highlighter | motion |
| Animated Gradient Text | 纯 CSS | | Line Shadow Text | 纯 CSS |
| Text Reveal | motion | | Video Text | SVG mask |
| Hyper Text | motion | | Scroll Based Velocity | motion |
| Comic Text / Kinetic Text | 纯 CSS/motion | | Text 3D Flip | 纯 CSS |

> **高价值低成本子集**（纯 CSS、与 hulian 签名渐变/token 契合度高）：Aurora Text、Animated Gradient Text、Animated Shiny Text、Sparkles Text。

### 2.4 Buttons（特效按钮，全缺）

归属：hulian `Button` 的**特效 variant** 或 `effects` 独立件。

| MagicUI | 依赖 | 备注 |
|---|---|---|
| Rainbow Button | 纯 CSS | 彩虹流光边 |
| Shimmer Button | 纯 CSS | 微光扫过（与 motion tokens 的 `shimmer` 同源） |
| Ripple Button | motion/CSS | 点击波纹 |
| Pulsating Button | 纯 CSS | 脉冲 |
| Shiny Button | motion | 社区 |
| Interactive Hover Button | motion | 社区 |

### 2.5 Backgrounds（特效背景，全缺）

归属：新增 `effects/backgrounds` 子组（或 `layout/backgrounds`）。绝大多数纯 CSS/SVG，零运行时，**与「沿用 motion + 纯 CSS 优先」策略最契合，ROI 高**。

| MagicUI | 依赖 | | MagicUI | 依赖 |
|---|---|---|---|---|
| Flickering Grid | canvas | | Hexagon Pattern | SVG |
| Animated Grid Pattern | motion | | Striped Pattern | 纯 CSS |
| Retro Grid | 纯 CSS | | Interactive Grid Pattern | motion |
| Ripple | 纯 CSS | | Light Rays | 纯 CSS |
| Dot Pattern | SVG | | Noise Texture | SVG filter |
| Grid Pattern | SVG | | Warp Background (社区) | motion |

### 2.6 Device Mocks（设备外壳，全缺）

归属：新增 `mockups` 顶层分类（非动效，纯展示外壳，多为内联 SVG）。

| MagicUI | 依赖 |
|---|---|
| Safari | 纯 SVG |
| iPhone | 纯 SVG |
| Android | 纯 SVG |

### 2.7 Community（精选缺口）

按需挑选，优先级低于以上六类：File Tree、Code Comparison、Scroll Progress、Neon Gradient Card、Animated Circular Progress Bar（hulian 已有 Progress，可作环形变体）、Cool Mode、Pixel Image、Backlight。

---

## 3. 缺口汇总与建议优先级

| 分组 | 总数 | 已落 | 缺 | 纯 CSS/SVG 占比 | 建议优先级 |
|---|---|---|---|---|---|
| Components | 16 | 2 | 14 | 中 | P2 |
| Special Effects | 9 | 0 | 9 | 中（Confetti/Particles 需三方） | P2 |
| Text Animations | ~18 | 0 | 18 | 高 | **P1** |
| Buttons | 6 | 0 | 6 | 高 | **P1** |
| Backgrounds | ~12 | 0 | 12 | **很高** | **P1** |
| Device Mocks | 3 | 0 | 3 | 纯 SVG | P2 |
| Community | 多 | 0 | 多 | 不一 | P3 |

**建议落地顺序**（基于「纯 CSS/SVG 零依赖 + 与 hulian 签名 token 契合」）:

1. **P1-A 特效背景批**：Dot Pattern、Grid Pattern、Retro Grid、Ripple、Striped Pattern（纯 CSS/SVG，零运行时，同 Marquee 范式）
2. **P1-B 文字动画批**：Aurora Text、Animated Gradient Text、Animated Shiny Text、Sparkles Text（纯 CSS，吃 hulian 渐变 token）
3. **P1-C 特效按钮批**：Shimmer Button（复用 motion tokens `shimmer`）、Rainbow Button、Pulsating Button、Ripple Button
4. **P2 特效核心**：Border Beam、Shine Border、Animated Beam（absorption §3.4 已点名）、Magic Card、Meteors
5. **P2 设备外壳**：Safari / iPhone / Android（纯 SVG，新增 `mockups` 分类）
6. **P3 重依赖件**：Globe(cobe)、Particles/Icon Cloud(canvas)、Confetti(canvas-confetti)——逐件评估是否值得引依赖

> **每批一个 session**（成本规则 Rule 1：单 session 单任务）。每批接入前各自开 spec + plan，复用 `effects` 起步 spec 的吸取范式。

---

## 4. 不做 / 排除项

- **不引入 MagicUI 作为 npm 依赖**——MagicUI 是 copy-paste 源码，吸取范式 = 抄骨架换 token（同已落 NumberTicker/Marquee）。
- **不让 MagicUI 特效 Button 顶替 hulian 标准 Button**——作为 variant/特效件并存。
- **Tweet Card 等强三方数据耦合件**——暂排除。
- 本文档**不含任何组件实现代码**，仅为 roadmap。后续每批实现各自开 design spec。
