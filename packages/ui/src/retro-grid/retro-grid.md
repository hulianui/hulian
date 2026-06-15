---
slug: retro-grid
name: RetroGrid
category: decoration
group: backdrop
tags: [animated]
exports: [RetroGrid]
status: enriched
---

# RetroGrid

> 复古透视网格 · CSS 滚动 + reduced-motion · decoration/backdrop · #animated

## 何时用

营造合成波/赛博朋克风的透视滚动网格地平线。要动态透视网格用本组件；要静态平铺线网格用 [GridPattern](../grid-pattern/grid-pattern.md)，点状用 [DotPattern](../dot-pattern/dot-pattern.md)。

## 导入
```ts
import { RetroGrid } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| angle | `number` | `65` | 透视倾斜角度（度） |
| cellSize | `number` | `60` | 网格单元像素 |
| opacity | `number` | `0.5` | 整体不透明度 |
| duration | `number` | `12` | 滚动一轮秒数（越大越慢） |

> 继承 `ComponentPropsWithoutRef<"div">`。颜色取 `currentColor`，用 `text-*` 工具类控制。

## 示例
```tsx
<div className="relative h-56 overflow-hidden rounded-xl border">
  <RetroGrid />
</div>

<RetroGrid cellSize={36} duration={24} className="text-primary" />
```

## 禁忌 / 坑

- 内部 `absolute inset-0` 铺满父级，必须放在 `relative`（且通常 `overflow-hidden`）定位容器内。
- 含 CSS 滚动动画，已内置 `prefers-reduced-motion` 降级（系统开启「减少动态效果」时停滚动）。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
