---
slug: flickering-grid
name: FlickeringGrid
category: decoration
group: backdrop
tags: [animated]
exports: [FlickeringGrid]
status: enriched
---

# FlickeringGrid

> 闪烁网格 · canvas 像素方格随机明灭 + ResizeObserver 自适应 + 颜色吃主题 token(逐帧现取) · decoration/backdrop · #animated

## 何时用

需要科技感/数据感的像素方格背景，且方格随机明灭闪烁时用。基于 canvas，自带 ResizeObserver 跟随容器尺寸；若要静态规则网格（不闪烁、更轻），用 [GridPattern](../grid-pattern/grid-pattern.md)；若要点阵用 [DotPattern](../dot-pattern/dot-pattern.md)；若要复古透视网格用 [RetroGrid](../retro-grid/retro-grid.md)。

## 导入
```ts
import { FlickeringGrid } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`，额外：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| squareSize | number | 4 | 每个方格边长（px），越小越密 |
| gridGap | number | 6 | 方格间距（px） |
| flickerChance | number | 0.3 | 每帧每格闪烁概率（乘 deltaTime）。0=静态网格，1=高频闪烁 |
| maxOpacity | number | 0.3 | 方格最大不透明度（0~1），越高越明显 |
| color | string | `--color-foreground` | 方格颜色，任意 CSS 颜色字符串。不传则从容器 `color`/token 解析 RGB 随主题切换 |
| width | number | — | 固定宽度（px）。不传用 ResizeObserver 跟随容器宽 |
| height | number | — | 固定高度（px）。不传用 ResizeObserver 跟随容器高 |

## 示例
```tsx
// 主题前景色默认网格，铺满定位父容器
<div className="relative h-48 overflow-hidden rounded-xl border">
  <FlickeringGrid className="absolute inset-0" />
</div>
```
```tsx
// 强调色 + 大方格 + 低频闪烁
<FlickeringGrid
  className="absolute inset-0"
  color="var(--color-primary)"
  squareSize={8}
  gridGap={4}
  flickerChance={0.1}
  maxOpacity={0.4}
/>
```

## 禁忌 / 坑

- 基于 canvas，须客户端渲染；父容器需 `relative` + `overflow-hidden`，组件自身用 `absolute inset-0` 铺满。
- 不传 `width`/`height` 时靠 ResizeObserver 跟随容器，故容器必须有确定尺寸（高度别塌成 0）。
- `color` 可传 `var(--color-*)`，组件会逐帧 getComputedStyle 解析（与只吃 rgb 的 Particles 不同），但每帧解析有微小成本。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
