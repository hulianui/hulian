---
slug: grid-pattern
name: GridPattern
category: decoration
group: backdrop
tags: []
exports: [GridPattern]
status: enriched
---

# GridPattern

> 网格背景 · 纯 SVG 线 + 虚线可配 + currentColor · decoration/backdrop

## 何时用

给区块铺线网格底纹（技术感/蓝图感）。要线网格用本组件；点状纹理用 [DotPattern](../dot-pattern/dot-pattern.md)，斜条纹用 [StripedPattern](../striped-pattern/striped-pattern.md)，带透视滚动的复古网格用 [RetroGrid](../retro-grid/retro-grid.md)。

## 导入
```ts
import { GridPattern } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width | `number` | `40` | 单元宽 |
| height | `number` | `40` | 单元高 |
| x | `number` | `0` | pattern x 偏移 |
| y | `number` | `0` | pattern y 偏移 |
| strokeDasharray | `string \| number` | `0` | 线虚线模式；`0` 实线，传如 `"4 2"` 即虚线 |

> 继承 `ComponentPropsWithoutRef<"svg">`。颜色取 `currentColor`，用 `text-*` 工具类控制。

## 示例
```tsx
<div className="relative h-48 overflow-hidden rounded-xl border">
  <GridPattern />
</div>

<GridPattern width={24} height={24} strokeDasharray="3 2" className="text-muted-foreground" />
```

## 禁忌 / 坑

- 内部 `absolute inset-0` 铺满父级，必须放在 `relative`（且通常 `overflow-hidden`）定位容器内。
- 颜色靠 `currentColor`，用 `text-*` 改色。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
