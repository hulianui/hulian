---
slug: grid-distortion
name: GridDistortion
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GridDistortion]
status: enriched
---

# GridDistortion

> 网格扭曲 · 鼠标拖拽的液态网格扭曲 WebGL 背景 · 数据纹理位移场 + 鼠标速度涟漪/弛豫回弹(ogl·零外部资源默认程序化网格底纹·token 着色·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要"鼠标划过即液态涟漪扭曲"的强交互网格背景（hero、互动落地页）时用。要静态不动的几何网格用 [GridPattern](../grid-pattern/grid-pattern.md)；要复古透视网格地平线用 [RetroGrid](../retro-grid/retro-grid.md)；要鼠标聚光不要扭曲用 [Spotlight](../spotlight/spotlight.md)。本组件交互核心是鼠标速度驱动的位移涟漪 + 弛豫回弹，也可扭曲传入图片。

## 导入
```ts
import { GridDistortion } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| grid | `number` | `15` | 位移网格边长（格子数），JS 每帧迭代 grid²，建议 8-30 |
| mouse | `number` | `0.1` | 鼠标影响半径因子（相对网格比例），影响范围 = grid × mouse |
| strength | `number` | `0.15` | 位移强度，鼠标速度 × 该系数写入位移场，越大涟漪越剧烈 |
| relaxation | `number` | `0.9` | 弛豫系数（每帧衰减，0-1），越近 1 余韵越长 |
| imageSrc | `string` | - | 被扭曲的图像；不传则程序化生成 chart token 网格底纹（推荐）；传入需同源或 CORS |
| color | `string` | `--color-chart-1` | 网格底纹主色（仅 imageSrc 未传时生效），任意 CSS 颜色 |
| className | `string` | - | 透传根容器（或兜底 div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认网格底纹 div） |

## 示例
```tsx
// 默认：程序化网格底纹，鼠标划过扭曲
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <GridDistortion />
</div>
```
```tsx
// 高密度 + 强扭曲
<GridDistortion grid={24} strength={0.3} mouse={0.18} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR / 无 WebGL 仅出静态网格底纹 fallback。
- `grid` 是 JS 侧每帧 O(grid²) 迭代，调到 30 以上会明显吃 CPU，谨慎。
- 传 `imageSrc` 扭曲外部图须同源或目标开启 CORS，否则 WebGL 纹理被污染读取失败。
- 根需放进 `relative overflow-hidden` 定位容器并自带高度（如 `h-64`）；扭曲交互依赖指针事件，移动端退化静态。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
