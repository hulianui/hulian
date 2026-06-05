# 瑚琏 Hulian A2.4 续 — 动效族 `effects` 特效背景批设计

- **日期**: 2026-06-03
- **状态**: 自主推进模式（用户 goal「spec - plan - exec 完成再通知我」）—— 设计裁决按本 spec 做合理默认并文档化，不阻塞等审，收尾统一通知。
- **本 spec 覆盖范围**: `effects` 分类「特效背景」批 **5 件** —— **DotPattern · GridPattern · RetroGrid · Ripple · StripedPattern**。源自 magicui.design Backgrounds 区，按 MagicUI 缺口对照 roadmap 的 **P1-A** 首批。
- **上游依据**:
  - `2026-06-03-hulian-magicui-gap-analysis.md`（缺口对照；P1-A = 特效背景批，纯 CSS/SVG 零依赖优先）
  - `2026-06-03-hulian-a2-4-effects-number-ticker-marquee-design.md`（`effects` 起步范式：抄实现骨架 + 换瑚琏 token + 统一 API + 复用 `motion` + 关键帧落 `@hulianui/tokens` preset.css，**不新增 npm 依赖**）
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 `effects` 分类；§6 硬约束）
  - 项目记忆 `hulian-phase-status`（固化坑：三道门 / 精确 git add 禁 -A / 别碰他人 WIP）

---

## 1. 本批吸取模式与共性

延续 A2.4 「Magic UI = copy-paste 源码」吸取范式，本批 5 件**全部纯 CSS/SVG，零运行时**：

> 吸取 = 抄 MagicUI 背景实现骨架 → **换瑚琏语义 token（颜色走 `currentColor`，由 `text-*` 类驱动，默认 `text-border`）** → 统一成瑚琏 API → 动画关键帧落 `@hulianui/tokens` preset.css（CSS 侧动效 SSOT，同 `hulian-marquee`）。

**全批共性硬约束**：

1. **RSC-safe，无 `"use client"`**（纯 CSS/SVG，同 Marquee/Breadcrumb/Alert）。
2. **背景填充层语义**：根元素默认 `absolute inset-0 h-full w-full`（铺满最近的 `relative` 定位父容器），`pointer-events-none`（不挡交互），`aria-hidden` 由调用方语义决定——背景是纯装饰，组件根**恒挂 `aria-hidden` 默认不挂**？裁决：**不强挂 aria-hidden**，因背景层无文本内容、无语义节点，AT 本就跳过；但保留 `pointer-events-none` 防遮挡。
3. **颜色不写死**：MagicUI 默认 gray-*，瑚琏改为 `currentColor`——根元素默认带 `text-border` 类，用户可 `className="text-muted"` / `text-primary` 覆盖，自动吃主题明暗。
4. **动画件（RetroGrid / Ripple）**：关键帧落 preset.css；恒挂 `motion-reduce:[animation:none]` 尊重 `prefers-reduced-motion`。
5. **config 落 CSS 变量**：可调几何参数（cellSize / 圈大小 / 条纹宽等）走内联 `style` 的 `--hulian-*` 变量，类名引用，便于 SSR 一致 + 无需 JS。
6. **className/props 透传**：`...props` 落根，`cn()` 合并 className（同全库范式）。

---

## 2. 逐件设计

### 2.1 DotPattern（点阵背景，纯 SVG）

MagicUI 原实现：`<svg>` 内 `<pattern>` 放一个 `<circle>`，`fill="url(#pattern)"` 平铺。瑚琏化：circle 用 `fill="currentColor"`，根 svg 带 `text-border`。

```ts
export interface DotPatternProps extends ComponentPropsWithoutRef<"svg"> {
  /** 平铺单元宽，默认 16 */
  width?: number;
  /** 平铺单元高，默认 16 */
  height?: number;
  /** 点在单元内的 x 偏移，默认 1 */
  cx?: number;
  /** 点在单元内的 y 偏移，默认 1 */
  cy?: number;
  /** 点半径，默认 1 */
  cr?: number;
  /** pattern 整体 x/y 偏移，默认 0 */
  x?: number;
  y?: number;
}
```

骨架：`<svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full fill-current text-border">` → `<defs><pattern id={patternId} ...><circle cx={cx} cy={cy} r={cr} /></pattern></defs>` → `<rect width="100%" height="100%" fill={url(#patternId)} />`。
- **patternId 唯一性**：用 `useId()`？——那会要 `"use client"`（useId 是 client hook，但 React 18 RSC 也支持 useId on server）。裁决：**用 `useId()`**（RSC 兼容，SSR 稳定，避免多实例 id 撞车）；useId 不强制 client，函数组件 server 渲染可用。

### 2.2 GridPattern（网格线背景，纯 SVG）

MagicUI 原实现：`<pattern>` 放一条 `<path>`（画单元右+下两边即成网格）。瑚琏化：`stroke="currentColor"`，`fill="none"`，根带 `text-border`。

```ts
export interface GridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  /** 单元宽，默认 40 */
  width?: number;
  /** 单元高，默认 40 */
  height?: number;
  /** pattern x/y 偏移，默认 0 */
  x?: number;
  y?: number;
  /** 线虚线模式，默认 0（实线）。传 "4 2" 即虚线 */
  strokeDasharray?: string | number;
}
```

骨架同 DotPattern，pattern 内换 `<path d={M ${width} 0 L 0 0 0 ${height}} fill="none" stroke="currentColor" />`。

### 2.3 RetroGrid（复古透视滚动网格，CSS 动画）

MagicUI 原实现：一个 `perspective` 容器内 transform `rotateX(angle)` 的双层 `linear-gradient` 网格，`background` 无限 `translateY` 滚动。瑚琏化：网格线色用 `currentColor`（根 `text-border`）；关键帧 `hulian-retro-grid` 落 preset.css；`motion-reduce` 停。

```ts
export interface RetroGridProps extends ComponentPropsWithoutRef<"div"> {
  /** 透视角度（度），默认 65 */
  angle?: number;
  /** 网格单元像素，默认 60 */
  cellSize?: number;
  /** 整体不透明度，默认 0.5 */
  opacity?: number;
  /** 滚动一轮秒数，默认 12 */
  duration?: number;
}
```
- config 落 `--hulian-retro-grid-angle/-cell-size/-opacity/-duration` 内联变量。
- 关键帧 `hulian-retro-grid`：`from { transform: translateY(0) } to { transform: translateY(var(--hulian-retro-grid-cell-size)) }`（滚动一个单元高即无缝）。

### 2.4 Ripple（同心脉冲圆环，CSS 动画）

MagicUI 原实现：N 个绝对居中、尺寸递增的 `<div>` 圆环，逐圈延迟脉冲（scale + opacity）。瑚琏化：边框色 `currentColor`（根 `text-border`）；关键帧 `hulian-ripple` 落 preset.css；`motion-reduce` 停（停后静态同心圆仍可见）。

```ts
export interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  /** 最内圈直径 px，默认 210 */
  mainCircleSize?: number;
  /** 最内圈不透明度，默认 0.24 */
  mainCircleOpacity?: number;
  /** 圈数，默认 8 */
  numCircles?: number;
}
```
- 每圈：`size = mainCircleSize + i*70`，`opacity = mainCircleOpacity - i*0.03`，`animationDelay = i*0.06s`，逐圈落内联 style。
- 关键帧 `hulian-ripple`：`from { transform: translate(-50%,-50%) scale(0.9); opacity: var(...) } to { transform: translate(-50%,-50%) scale(1.4); opacity: 0 }`。

### 2.5 StripedPattern（斜条纹背景，纯 CSS）

无 SVG，纯 `repeating-linear-gradient`。瑚琏化：条纹色 `currentColor`（根 `text-border`）；无动画。

```ts
export interface StripedPatternProps extends ComponentPropsWithoutRef<"div"> {
  /** 条纹角度（度），默认 45 */
  angle?: number;
  /** 条纹+间隔单元宽 px，默认 10 */
  size?: number;
}
```
- 根 `absolute inset-0 h-full w-full pointer-events-none text-border`，`backgroundImage: repeating-linear-gradient(var(--angle), currentColor 0, currentColor 1px, transparent 1px, transparent var(--size))`，几何走内联变量。

---

## 3. preset.css 新增关键帧（2 个）

紧随 `hulian-marquee` 之后追加（CSS 侧动效 SSOT）：

```css
/* effects/RetroGrid 透视网格滚动：每轮平移一个单元高即无缝 */
@keyframes hulian-retro-grid {
  from { transform: translateY(0); }
  to   { transform: translateY(var(--hulian-retro-grid-cell-size, 60px)); }
}

/* effects/Ripple 同心圆脉冲：放大 + 淡出 */
@keyframes hulian-ripple {
  from { transform: translate(-50%, -50%) scale(0.9); }
  to   { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}
```

---

## 4. 文件落点（每件四件套 + 桶）

```
packages/ui/src/dot-pattern/{dot-pattern.tsx, .types.ts, .test.tsx, .showcase.tsx, index.ts}
packages/ui/src/grid-pattern/{...}
packages/ui/src/retro-grid/{...}
packages/ui/src/ripple/{...}
packages/ui/src/striped-pattern/{...}
```

接线 5 处（全库既有范式，无新机制）：
1. `packages/ui/src/index.ts` —— 5 个 `export * from "./xxx"`
2. `packages/tokens/src/preset.css` —— 2 个关键帧
3. `apps/www/lib/manifest.ts` —— 5 个 `ComponentMeta`，`category: "effects"`，`status: "new"`
4. `apps/www/lib/registry.tsx` —— 5 个 showcase import + slug 映射
5. （无需改 CategoryKey：`effects` 已存在）

---

## 5. TDD 测试要点（每件 ≥4 用例，对齐 Marquee 测试粒度）

- **DotPattern/GridPattern**：① 渲染出 `<svg>` 且含 `<pattern>`；② pattern 的 width/height 属性 = props；③ DotPattern circle 的 r = cr / GridPattern path 的 stroke=currentColor；④ 根 svg 带 `absolute inset-0` + `pointer-events-none`；⑤ className/props 透传。
- **RetroGrid**：① 渲染根 div；② 动画层带 `hulian-retro-grid` 动画类；③ `motion-reduce:[animation:none]` 恒在；④ cellSize/duration 落 CSS 变量；⑤ className 透传。
- **Ripple**：① 渲染 numCircles 个圈 div（默认 8）；② numCircles 可配置；③ 每圈带 `motion-reduce:[animation:none]`；④ 第 i 圈尺寸/延迟随 i 变化（断言 style）；⑤ className 透传。
- **StripedPattern**：① 渲染根 div；② backgroundImage 含 `repeating-linear-gradient`；③ angle/size 落 CSS 变量；④ `pointer-events-none` + `absolute inset-0`；⑤ className 透传。

预计新增 ~25 用例（5 件 × ~5）。

---

## 6. 不做 / YAGNI

- **不做 glow 变体**（DotPattern MagicUI 有 radial-gradient mask glow，复杂且少用，列 future）。
- **不做 Interactive Grid Pattern**（需鼠标 hover 高亮单元 → 要 `"use client"` + 状态，单独件单独批）。
- **不引入任何 npm 依赖**。
- **不抽公共 `<BgLayer>` 基类**（5 件结构差异大，过早抽象违反 absorption §6；各自独立四件套）。
- 颜色仅暴露 `currentColor` 单通道（YAGNI，不做多色 prop）。
