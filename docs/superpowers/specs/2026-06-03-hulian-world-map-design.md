# 瑚琏 WorldMap 组件设计

- 日期：2026-06-03
- 状态：已审批（待实现）
- 归属：瑚琏 UI 库 · MagicUI/Aceternity 风格特效族（与 AnimatedBeam 同家族）

## 1. 背景与目标

瑚琏 UI 库目前缺任何地图类组件。本设计新增一个 **WorldMap**：Aceternity 风格的
**点阵世界地图底图 + 经纬度之间的动画弧线连线**，用于"全球节点 / 跨地域连接"类可视化展示。

核心约束（与瑚琏既有取舍一致）：

- **零运行时依赖**：不引入 `dotted-map`、`cobe` 等运行时包（与 Globe 延后、远程图片本地化的决策一脉相承）。
- **全吃主题 token**：点色 / 线色在 light/dark 下自动切换，不出现 Aceternity 原版 `<img>` data-URI 吃不到主题的问题。
- **沿用组件约定**：5 文件结构、`cn`、`"use client"`、`ShowcaseSpec`、中文「吸取自 X + 瑚琏化」注释、vitest + jsdom 测试。

## 2. 文件结构

`packages/ui/src/world-map/`：

| 文件 | 职责 |
|------|------|
| `world-map.tsx` | 运行时组件（渲染底图 circle + 弧线 + 端点脉冲） |
| `world-map.types.ts` | `WorldMapProps` |
| `world-map.showcase.tsx` | `worldMapShowcase: ShowcaseSpec`（3 态） |
| `world-map.test.tsx` | vitest + jsdom 渲染断言 |
| `world-map.dots.ts` | **生成数据**：预烘的点阵坐标数组 + 投影系数（提交进仓库） |
| `world-map.bake.mjs` | 一次性烘焙脚本（仅作者本地跑，不进运行时依赖，留作可复现） |
| `index.ts` | re-export 组件 / 类型 / showcase |

并在 `packages/ui/src/index.ts` 追加 `export * from "./world-map";`（按既有 barrel 风格），
www 文档侧 `manifest.ts` / `registry.tsx` 按既有约定登记（与其它特效件同步）。

## 3. API

```ts
export interface WorldMapDot {
  start: { lat: number; lng: number; label?: string };
  end:   { lat: number; lng: number; label?: string };
}

export interface WorldMapProps {
  /** 要画的连线对（经纬度）。不传 / 空数组则只显示点阵底图。 */
  dots?: WorldMapDot[];
  /** 弧线颜色（CSS 颜色，默认 chart token）。 */
  lineColor?: string;   // 默认 "var(--color-chart-1)"
  /** 点阵颜色（默认 border token）。 */
  dotColor?: string;    // 默认 "var(--color-border)"
  /** 单条弧线画入时长(s)。 */
  duration?: number;    // 默认 1
  className?: string;
}
```

## 4. 实现

### 4.1 底图（零依赖核心）

**烘焙阶段**（`world-map.bake.mjs`，作者本地 `npx dotted-map` 或临时 devDep，跑一次）：

1. `new DottedMap({ height: H, grid: "diagonal" })` 生成全球点阵（grid 调疏，目标 ~800–1200 点）。
2. 从生成的 SVG 抽出每个点的 `cx/cy`，归一/投影到固定 `viewBox 0 0 800 400` 的**等距圆柱投影 (equirectangular)** 空间。
3. 同时确定 `lat/lng → (x,y)` 的线性投影函数并把系数写入数据文件，保证**弧线端点与点阵对齐**：
   - `x = (lng + 180) * (800 / 360)`
   - `y = (90 - lat) * (400 / 180)`
   - 烘焙脚本必须让 dotted-map 的点阵落在同一投影下（必要时按其 getPin 采样校准为同款线性映射）。
4. 输出 `world-map.dots.ts`：`export const WORLD_DOTS: ReadonlyArray<readonly [number, number]> = [...]`，
   外加 `export const VIEWBOX = { w: 800, h: 400 } as const;` 与投影函数 `projectPoint(lat, lng)`。

**运行时**（`world-map.tsx`）：

- 单个 `<svg viewBox="0 0 800 400" aria-hidden>`。
- 底图：`WORLD_DOTS.map(([x, y]) => <circle cx={x} cy={y} r={0.6} fill={dotColor} />)`。点色走 token，主题自动切。
- DOM 节点量级 ~1k，静态、`aria-hidden`，可接受。

### 4.2 弧线 & 端点（复用 AnimatedBeam 画法）

- **几何**：`projectPoint(start)` / `projectPoint(end)` → 二次贝塞尔 `M sx,sy Q cx,cy ex,ey`，
  控制点 `cy` 上抬（curvature 随两点距离自适应，弧度统一上凸），与 AnimatedBeam 同款。
- **描边**：`<linearGradient>` 沿路径，两端 `stopOpacity=0`、中段 `lineColor`，形成"行进高光"观感。
- **画入动画**：motion `<motion.path>` 的 `pathLength: 0 → 1`，`duration` 控制，`repeat: Infinity`，
  多条按 `index * stagger` 错开起始。
- **端点**：每个 start/end 处画实心小点（`fill={lineColor}`）+ 一圈脉冲环
  （`<motion.circle>` animate `r` 与 `opacity` 循环），signature 观感，成本低。

### 4.3 SSR / 测试安全

- 全部几何在固定 viewBox 内由纯函数算出，**不依赖 `getBoundingClientRect` / ResizeObserver**
  （相比 AnimatedBeam 更稳，jsdom 下天然安全）。
- `"use client"`（含 motion）。

## 5. Showcase（`ShowcaseSpec`，3 态）

| 态 | 内容 |
|----|------|
| `单条连线` | 北京 → 纽约一条弧 |
| `多点辐射` | 一个枢纽（如上海）辐射到 4 座城市 |
| `纯底图` | 不传 dots，仅点阵 |

`renderWithProps` 用「多点辐射」，`toCode` 给最小用法片段。

## 6. 测试（vitest + jsdom）

- 渲染不抛、`<svg>` 存在。
- 不传 dots：点阵 `circle` 数量 > 0、无弧线 `path`。
- 传 N 条 dots：弧线 `path` 数量 == N（端点脉冲 circle 另计）。
- `<linearGradient>` defs 存在。

## 7. 已定取舍（YAGNI）

- 弧线动画用 **pathLength 画入 + 渐变描边**（Aceternity 招牌），**不**做 AnimatedBeam 那种持续流光平移。
- 端点**带脉冲环**（纳入）。
- 底图范围只做**世界地图**；中国地图变体本期不做。
- 不做交互（hover/点击 tooltip）、不做地图缩放/平移 —— 本期纯展示件。

## 8. 不在本期范围

- 中国行政区地图变体。
- 端点 label 的可视化渲染（API 预留 `label?` 字段但本期不画文字，避免排版复杂度）。
- 主题之外的可配置投影 / 自定义底图区域。
