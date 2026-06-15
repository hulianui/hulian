---
slug: ripple-grid
name: RippleGrid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [RippleGrid]
status: enriched
---

# RippleGrid

> 涟漪网格 WebGL 背景 · 同心 sin 波推挤网格 + 暗角/辉光/彩虹配色 + 指针局部涟漪(ogl·chart token·reduced-motion 降级静态网格) · decoration/backdrop · #animated #webgl

## 何时用

要「网格被波纹推挤起伏」的有机动态底纹（hero / 卡片背景）。要静态规整网格用 [GridPattern](../grid-pattern/grid-pattern.md)；要透视退场感网格用 [RetroGrid](../retro-grid/retro-grid.md)；RippleGrid 是这族里唯一让网格随同心波纹+指针涟漪扭动、并支持彩虹循环配色的一件。

## 导入
```ts
import { RippleGrid } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| enableRainbow | `boolean` | `false` | 彩虹循环配色（随时间在 RGB 间渐变，忽略 color） |
| color | `string` | `var(--color-chart-1)` | 网格主色，任意 CSS 颜色串；enableRainbow=true 时被忽略 |
| rippleIntensity | `number` | `0.05` | 涟漪扰动强度，0 = 静止网格 |
| gridSize | `number` | `10` | 网格密度，越大越密 |
| gridThickness | `number` | `15` | 网格线锐度（粗细反向量），越大越细越锐 |
| fadeDistance | `number` | `1.5` | 中心向四周的距离淡出指数，越大越聚焦中心 |
| vignetteStrength | `number` | `2` | 暗角强度，0 = 无暗角 |
| glowIntensity | `number` | `0.1` | 网格线发光强度，0 = 无辉光 |
| opacity | `number` | `1` | 整体不透明度（0–1） |
| gridRotation | `number` | `0` | 网格旋转角度（度），45 = 菱形网格 |
| mouseInteraction | `boolean` | `true` | 指针处额外激起一圈涟漪 |
| mouseInteractionRadius | `number` | `1` | 鼠标涟漪影响半径 |
| className | `string` | — | 透传到根容器（或 fallback div） |
| fallback | `ReactNode` | 静态网格底纹 div | reduced-motion / 无 WebGL 时的静态替代内容 |

## 示例
```tsx
// 默认：深色底 + chart-1 token，自动明暗适配
<div className="relative h-64 overflow-hidden rounded-xl">
  <RippleGrid />
</div>

// 彩虹循环配色 + 略强涟漪
<RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12} />
```

## 禁忌 / 坑

- 须客户端渲染（WebGL/ogl），组件自带 `"use client"`；RSC 页里挂 client 子树或动态 import。
- 组件自带 `absolute inset-0 z-0`，父容器须有定位 + 尺寸 + `overflow-hidden`，否则不可见。
- `enableRainbow` 会无视 `color`，两者别同时指望；要单一主题色就关掉彩虹。
- reduced-motion / 无 WebGL 时降级为静态网格 `fallback`，关键信息别绑动画。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
