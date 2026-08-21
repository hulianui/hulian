---
slug: dot-pattern
name: DotPattern
category: decoration
group: backdrop
tags: []
exports: [DotPattern]
status: enriched
---

# DotPattern

> 铺一层跟随主题配色的点阵背景，点距可调 · decoration/backdrop

## 何时用

给卡片/区块/Hero 加点阵纹理底。要点状纹理用本组件；要线网格用 [GridPattern](../grid-pattern/grid-pattern.md)，斜条纹用 [StripedPattern](../striped-pattern/striped-pattern.md)，径向辉光用 [Spotlight](../spotlight/spotlight.md)。

## 导入
```ts
import { DotPattern } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width | `number` | `16` | 平铺单元宽 |
| height | `number` | `16` | 平铺单元高 |
| cx | `number` | `1` | 点在单元内的 x 偏移 |
| cy | `number` | `1` | 点在单元内的 y 偏移 |
| cr | `number` | `1` | 点半径 |
| x | `number` | `0` | pattern 整体 x 偏移 |
| y | `number` | `0` | pattern 整体 y 偏移 |

> 继承 `ComponentPropsWithoutRef<"svg">`（`className` 等）。颜色取 `currentColor`，用 `text-*` 工具类控制（如 `text-muted-foreground`）。

## 示例
```tsx
<div className="relative h-48 overflow-hidden rounded-xl border">
  <DotPattern />
</div>

<DotPattern width={28} height={28} cr={1.4} className="text-muted-foreground" />
```

## 禁忌 / 坑

- 内部 `absolute inset-0` 铺满父级，必须放在 `relative`（且通常 `overflow-hidden`）定位容器内，否则无法定位/会溢出。
- 颜色靠 `currentColor`，用 `text-*` 改色而非 `fill`。

## 相关
[GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
