---
slug: grid-scan
name: GridScan
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GridScan]
status: enriched
---

# GridScan

> 透视扫描网格 WebGL 背景 · 射线投射无限网格(实线/虚线/点线)+纵深推进的发光扫描脉冲+鼠标视差偏摆(ogl·token·reduced-motion 降级静态网格) · decoration/backdrop · #animated #webgl

## 何时用

需要科技感透视网格 + 纵深推进的发光扫描脉冲做 hero / 仪表盘背景时用。只要静态网格底纹（无扫描、无 WebGL）用 [GridPattern](../grid-pattern/grid-pattern.md)；要复古地平线透视网格用 [RetroGrid](../retro-grid/retro-grid.md)。

## 导入
```ts
import { GridScan } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| linesColor | `string` | `var(--color-border)` | 网格线颜色，CSS 颜色字符串，默认取 token 明暗自适应 |
| scanColor | `string` | `var(--color-primary)` | 扫描带发光颜色，默认取品牌主色 |
| gridScale | `number` | `0.1` | 网格密度（格子缩放），越小越密，建议 0.05–0.3 |
| lineThickness | `number` | `1` | 网格线粗细（屏幕像素） |
| lineStyle | `"solid" \| "dashed" \| "dotted"` | `"solid"` | 线条样式：实线 / 虚线 / 点线 |
| scanOpacity | `number` | `0.45` | 扫描带发光不透明度(0–1)，0=纯网格无脉冲 |
| scanDirection | `"forward" \| "backward" \| "pingpong"` | `"pingpong"` | 扫描方向：由远及近 / 由近及远 / 往返循环 |
| scanDuration | `number` | `2` | 单趟扫描时长(秒)，越大越慢 |
| scanDelay | `number` | `2` | 两趟扫描间停顿(秒)，pingpong 时仅影响起步延迟 |
| scanSoftness | `number` | `2` | 扫描带柔化程度，越大光带越宽越柔 |
| noiseIntensity | `number` | `0.01` | 颗粒噪声强度，0=干净无噪点 |
| parallax | `boolean` | `true` | 随鼠标轻微透视偏摆；reduced-motion / 无 WebGL 自动失效 |
| className | `string` | — | 透传根容器(或 fallback div) |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 叠在网格上方的内容，自动 relative z-10 层叠 |
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容，默认 token 静态网格 |

## 示例
```tsx
// 容器定高 + overflow-hidden，children 自动叠在网格之上
<div className="relative h-64 overflow-hidden rounded-xl">
  <GridScan />
  <div className="relative z-10 flex h-full items-center justify-center">
    GridScan
  </div>
</div>
```
```tsx
// 虚线网格 · 向前扫描
<GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />
```

## 禁忌 / 坑

- ogl/WebGL，仅客户端渲染；SSR 出 fallback 静态网格，水合后切真 shader 属正常。reduced-motion / 无 WebGL 下停在 `fallback`。
- 全屏背景层置于 opaque 背景的非层叠上下文父级里可能被父背景盖住而全黑，见 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- 自定义 `scanColor`/`linesColor` 传 CSS 变量须用 `--color-` 前缀 token，裸 `var(--primary)` 不解析，见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
