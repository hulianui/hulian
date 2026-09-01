---
"@hulianui/ui": patch
---

`Stat` 标题行固定 32px 高，有无 `icon` 都一样（#339）。

0.58.0 给角标图标加了 `size-8` 的底座之后，有 icon 的卡标题行 32px、没 icon 的只有 20px。同一排 KPI 卡只要一半传 icon、一半不传（常见于「右上角留给叠放的 Sparkline」的那两张），数值行起点就差 12px、卡片高矮不齐。现在标题行 `min-h-8`，「要么全有 icon 要么全没有」这条约束由组件保证，消费方不必记。

<!-- changelog-en:start -->
The `Stat` header row is now a fixed 32px tall with or without `icon` (#339).

Since 0.58.0 the corner icon sits on a `size-8` base, so cards with an icon had a 32px header row while cards without one had 20px. In a row of KPI cards where some pass an icon and some do not (typically the ones reserving the top-right corner for an overlaid Sparkline), the value baseline shifted by 12px and card heights diverged. The header row now has `min-h-8`; the "all cards with icons or none" constraint is enforced by the component instead of being something consumers must remember.
<!-- changelog-en:end -->
