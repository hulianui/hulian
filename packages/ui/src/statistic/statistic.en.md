---
slug: statistic
name: Statistic
category: data-display
group: stat
tags: []
exports: [Statistic, formatStatistic, formatCountdown]
status: enriched
---

# Statistic

> A formatted statistic with grouping, precision, affixes, optional NumberTicker animation, and an SSR-safe countdown compound.

## When to use

Use Statistic to format a single number or render a countdown through `Statistic.Countdown`. [Stat](../stat/stat.md) is the complementary full KPI card with label, value, and comparison trend.

## Import
```ts
import { Statistic, formatStatistic, formatCountdown } from "@hulianui/ui"
```

## Props

### Statistic

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number \| string` | — | Numbers receive grouping and precision; strings render unchanged. |
| precision | `number` | — | Decimal places for numeric values. |
| groupSeparator | `boolean` | `true` | Enables thousands grouping. |
| animate | `boolean` | `false` | Uses NumberTicker entrance animation for numbers; animated values always group. |
| valueStyle | `CSSProperties` | — | Inline value color, size, or other styles. |
| align | `"start" \| "center" \| "end"` | `"start"` | Horizontal value alignment. |
| className | `string` | — | Custom class name. |

### Statistic.Countdown

| Name | Type | Default | Description |
|------|------|------|------|
| deadline* | `number` | — | Millisecond deadline on the same basis as `Date.now()`. |
| format | `string` | `"HH:mm:ss"` | Template supporting D/H/HH/m/mm/s/ss/S/SS/SSS. |
| valueStyle | `CSSProperties` | — | Inline value styles. |
| className | `string` | — | Custom class name. |

## Events

### Statistic.Countdown

| Event | Type | Description |
|------|------|------|
| onFinish | `() => void` | Fires once when the countdown reaches zero. |

## Slots

### Statistic

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Label above the value. |
| prefix | `ReactNode` | Currency symbol, icon, or other prefix. |
| suffix | `ReactNode` | Unit or other suffix. |

### Statistic.Countdown

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Countdown title. |
| prefix | `ReactNode` | Countdown prefix. |
| suffix | `ReactNode` | Countdown suffix. |

## Examples
```tsx
// Grouped decimal with a prefix
<Statistic title="Account balance" value={89234.56} precision={2} prefix="$" />

// Freeze the deadline once to avoid render and hydration drift
const [deadline] = useState(() => Date.now() + 1000 * 60 * 60);
<Statistic.Countdown title="Event ends in" deadline={deadline} format="D days HH:mm:ss" />
```

## Pitfalls
- Initialize countdown deadlines once with `useState(() => Date.now() + ...)`; computing them during every render drifts and can cause hydration mismatches.
- The value row is flex, so `text-center` on className does not align it; use `align`.
- Precision and grouping affect numeric values only. Strings render verbatim.

## Related
[Stat](../stat/stat.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
