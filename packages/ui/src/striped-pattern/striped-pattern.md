---
slug: striped-pattern
name: StripedPattern
category: decoration
group: backdrop
tags: []
exports: [StripedPattern]
status: enriched
---

# StripedPattern

> 斜条纹背景 · 纯 CSS 渐变 + currentColor · decoration/backdrop

## 何时用

给区块铺斜条纹底纹（警示带/施工感/质感分隔）。要条纹用本组件；点状用 [DotPattern](../dot-pattern/dot-pattern.md)，线网格用 [GridPattern](../grid-pattern/grid-pattern.md)，径向辉光用 [Spotlight](../spotlight/spotlight.md)。

## 导入
```ts
import { StripedPattern } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| angle | `number` | `45` | 条纹角度（度） |
| size | `number` | `10` | 条纹+间隔单元宽 px |

> 继承 `ComponentPropsWithoutRef<"div">`。颜色取 `currentColor`，用 `text-*` 工具类控制。

## 示例
```tsx
<div className="relative h-48 overflow-hidden rounded-xl border">
  <StripedPattern />
</div>

<StripedPattern angle={90} size={20} className="text-muted" />
```

## 禁忌 / 坑

- 内部 `absolute inset-0` 铺满父级，必须放在 `relative`（且通常 `overflow-hidden`）定位容器内。
- 颜色靠 `currentColor`，用 `text-*` 改色。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
