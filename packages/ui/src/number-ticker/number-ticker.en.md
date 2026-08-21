---
slug: number-ticker
name: NumberTicker
category: data-display
group: stat
tags: [animated]
exports: [NumberTicker, formatTicker]
status: enriched
---

# NumberTicker

> A viewport-triggered numeric tween with grouping, decimals, delay, and reduced-motion support.

## When to use

Use NumberTicker to animate a KPI or dashboard number from a starting value to a target. It renders only the number; use [Stat](../stat/stat.md) for a title, unit, and comparison, or [Statistic](../statistic/statistic.md) for richer formatting.

## Import
```ts
import { NumberTicker, formatTicker } from "@hulianui/ui"
```

## Props

Inherits every native `span` attribute except `children`.

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | - | Target value reached after entering the viewport. |
| startValue | `number` | `0` | Initial value; values above the target naturally count down. |
| decimalPlaces | `number` | `0` | Fraction digits passed to `Intl.NumberFormat`. |
| duration | `number` | `1.2` | Duration in seconds using `motionEase.out`. |
| delay | `number` | `0` | Delay after entering the viewport, in seconds. |

## Examples
```tsx
// Grouped integer
<NumberTicker value={12345} className="text-4xl font-semibold" />

// Percentage with one decimal
<NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />

// Count down
<NumberTicker startValue={100} value={0} className="text-4xl font-semibold" />
```

## Pitfalls

- IntersectionObserver and requestAnimationFrame drive the tween. Headless screenshots can capture the initial frame; use a real browser or reduced motion. See [[verify-sub-second-web-animation-via-headless-screenshot]].
- With `prefers-reduced-motion: reduce`, the final value renders immediately.

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [WorldMap](../world-map/world-map.md)
