---
slug: meter
name: Meter
category: data-display
group: stat
tags: []
exports: [Meter]
status: enriched
---

# Meter

> A semantic Base UI meter for a static quantity within a bounded range.

## When to use

Use Meter for current disk, battery, quota, or other capacity. Meter communicates how full a quantity is now through `role="meter"`; Progress communicates advancement of a task.

## Import
```ts
import { Meter } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | — | Current value. |
| min | `number` | `0` | Lower bound. |
| max | `number` | `100` | Upper bound. |
| showValue | `boolean` | `false` | Shows the formatted value. |
| className | `string` | — | Custom class, commonly used for width. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Optional label such as "Disk usage". |

## Examples
```tsx
// Label and value
<div className="w-64"><Meter value={72} label="Disk usage" showValue /></div>

// Bar only
<div className="w-64"><Meter value={64} /></div>
```

## Pitfalls
Use Progress for an advancing task, not Meter. The parent determines bar width, so give it an explicit width.

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
