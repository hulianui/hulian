---
slug: sparkline
name: Sparkline
category: data-display
group: info
tags: []
exports: [Sparkline, normalize, linePath, areaPath, barRects]
status: enriched
---

# Sparkline

> 内联趋势迷你图 · 无轴无网格的极简趋势 · line/area/bar 三态 + highlightLast 末点圆点 + 原生 SVG <title> tooltip(RSC 安全零 JS) · 几何抽纯函数(归一化/path/柱矩形)带单测 · 表格内联/KPI 卡/负载趋势(零依赖) · data-display/info

## 何时用

在表格单元格、KPI 卡、列表行内嵌一条「极简趋势」时用——无轴无网格、随文本流。需要带坐标轴/图例/交互 tooltip 的完整图表用 Chart（recharts）；只展示单值用 [Stat]/[Badge]。Sparkline 胜在零依赖、RSC 安全、可内联。

## 导入
```ts
import { Sparkline, normalize, linePath, areaPath, barRects } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `SparkDatum[]` | — | 纯数字序列或 `{x,y}` 点（取 y） |
| variant | `"line" \| "area" \| "bar"` | `"line"` | 渲染形态：折线 / 面积 / 柱 |
| width | `number` | `80` | 视口宽 |
| height | `number` | `24` | 视口高 |
| tone | `string` | `var(--color-primary)` | 描边/填充色。可传语义色名（`"primary"`/`"success"`/`"danger"`/`"chart-2"`，经 resolveTone 解析为 `var(--color-*)`）、任意 CSS 颜色或变量 |
| highlightLast | `boolean` | `false` | 在末点画强调圆点 |
| min | `number` | — | 归一化下界，不传从数据推 |
| max | `number` | — | 归一化上界，不传从数据推 |
| baseline | `number` | — | 基准线：在该数值处画一条横向虚线，让序列有个「对比的参照」而不只是形状。典型用法是上期均值 / 目标值 / 及格线。不传 `min`/`max` 时会把基准值一并纳入归一化域，保证它落在视口内而不是被裁到外面 |
| baselineTone | `string` | `var(--color-muted-foreground)` | 基准线颜色。取值同 `tone`（语义色名 / 任意 CSS 颜色 / 变量） |
| baselineLabel | `string` | — | 基准线的原生 tooltip 文案（渲染为 SVG `<title>`） |
| className | `string` | — | 外层类名 |

继承 `SVGProps<SVGSVGElement>`（除 `data`）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderTooltip | `(value: number, index: number) => ReactNode` | 渲染函数：逐点原生 tooltip，返回字符串渲染为 SVG `<title>`（零 JS，RSC 安全） |

## 示例
```tsx
// 表格内联趋势 + 末点强调 + 原生逐点 tooltip
<Sparkline
  data={[8, 9, 7, 11, 10, 13, 12, 15]}
  variant="line"
  tone="var(--color-primary)"
  highlightLast
  width={96}
  height={22}
  renderTooltip={(v, i) => `第 ${i + 1} 周期：${v}`}
/>

// 面积形态，语义色
<Sparkline data={series} variant="area" tone="chart-2" width={140} height={36} />
```

## 禁忌 / 坑

- tone 既接受语义色名（`"primary"`/`"chart-2"`，经 resolveTone 解析）也接受裸 CSS 变量；若手写 `var(...)` 给 SVG fill/stroke 须带 `--color-` 前缀，见 [[hulian-token-color-var-needs-color-prefix]]。
- renderTooltip 走原生 `<title>`，是浏览器悬停气泡（有延迟、不可定制样式），不是 JS 浮层——换取的是 RSC 安全、零客户端 JS。

## 相关
[ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
