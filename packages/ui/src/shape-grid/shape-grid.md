---
slug: shape-grid
name: ShapeGrid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [ShapeGrid]
status: enriched
---

# ShapeGrid

> 几何网格 · 无限滚动几何网格背景 · canvas2d 绘制方/圆/三角/六边形四形，沿任意方向匀速平移环绕 + 鼠标悬停缓动填充与渐隐拖尾（零依赖·token 配色·reduced-motion 静止·jsdom 安全） · decoration/backdrop · #animated #webgl

## 何时用

要持续滚动 + 悬停点亮的几何单元背景（看板/落地页底纹）。要静态点阵用 [DotPattern](../dot-pattern/dot-pattern.md)，静态线网用 [GridPattern](../grid-pattern/grid-pattern.md)；ShapeGrid 是这族里唯一 canvas2d 零依赖、支持四种形状无限平移环绕 + 悬停渐隐拖尾的一件（不走 WebGL，jsdom 测试安全）。

## 导入
```ts
import { ShapeGrid } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | `"right"｜"left"｜"up"｜"down"｜"diagonal"` | `"right"` | 网格滚动方向 |
| speed | `number` | `1` | 滚动速度（像素/帧，内部 clamp 下限 0.1）；reduced-motion 下强制静止 |
| borderColor | `string` | `var(--color-border)` | 单元边线颜色，任意 CSS 颜色串 |
| squareSize | `number` | `40` | 单元边长（px），同时决定网格密度 |
| hoverFillColor | `string` | `var(--color-primary)` | 悬停时单元填充色，淡入/淡出缓动 |
| shape | `"square"｜"circle"｜"triangle"｜"hexagon"` | `"square"` | 单元形状 |
| hoverTrailAmount | `number` | `0` | 悬停拖尾长度（保留多少历史单元渐隐），0 = 无拖尾 |
| className | `string` | — | 透传到根 canvas |
| style | `CSSProperties` | — | 透传到根 canvas 的内联样式 |

## 示例
```tsx
// 默认：方格向右滚动，吃 border token
<div className="relative h-56 overflow-hidden rounded-xl">
  <ShapeGrid className="absolute inset-0 opacity-90" />
</div>

// 圆点阵 · 向上滚 · 悬停拖尾 + chart-2 填充
<ShapeGrid
  shape="circle"
  direction="up"
  hoverTrailAmount={6}
  hoverFillColor="var(--color-chart-2)"
  className="absolute inset-0 opacity-90"
/>
```

## 禁忌 / 坑

- 自身是 canvas，没有 `absolute inset-0`，须自己用 className 定位铺满（示例的 `absolute inset-0`）；父容器要有定位 + 尺寸 + `overflow-hidden`。
- 颜色 token 喂给 canvas 须带 `--color-` 前缀（如 `var(--color-chart-2)`），裸 `var(--primary)` 不解析见 [[hulian-token-color-var-needs-color-prefix]]。
- reduced-motion 下速度按 0 处理（静止），动效别当关键反馈。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
