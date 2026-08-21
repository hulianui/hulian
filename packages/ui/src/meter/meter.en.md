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

> Displays a value within a known range using a semantic gauge bar.

## When to use

Use Meter for current disk, battery, quota, or other capacity. Meter communicates how full a quantity is now through `role="meter"`; Progress communicates advancement of a task.

## Import
```ts
import { Meter } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | - | Current value. |
| min | `number` | `0` | Lower bound. |
| max | `number` | `100` | Upper bound. |
| showValue | `boolean` | `false` | Shows the value text. It reads `(value - min) / (max - min)` as a percentage, matching the indicator, with at most one decimal. |
| formatValue | `(info: { value, min, max, percent }) => string` | - | Custom value text. The returned string drives both the visible text and `aria-valuetext`, so the two can never disagree. `percent` is already normalized and clamped to 0-100 (not rounded). Use it for absolute wording: `({ value, max }) => \`${value} / ${max} questions\``. |
| className | `string` | - | Custom class, commonly used for width. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Label such as "Disk usage". **This is the only way to give `role="meter"` an accessible name** (it is wired through `aria-labelledby`); without it the meter is unnamed to a screen reader, and a heading you draw yourself does not count. |

## Examples
```tsx
// Label and value
<div className="w-64"><Meter value={72} label="Disk usage" showValue /></div>

// max is not 100: the value text follows the ratio (1041/1324 reads 78.6%), matching the indicator
<div className="w-64"><Meter value={1041} max={1324} label="Linked to textbook" showValue /></div>

// Absolute wording: the visible text and what a screen reader announces are the same sentence
<div className="w-64">
  <Meter
    value={1041}
    max={1324}
    label="Linked to textbook"
    showValue
    formatValue={({ value, max }) => `${value} / ${max} questions`}
  />
</div>

// Bar only
<div className="w-64"><Meter value={64} /></div>
```

## Pitfalls

Use Progress for an advancing task, not Meter. The parent determines bar width, so give it an explicit width.

- **Only `label` provides the accessible name.** `role="meter"` is wired to it through `aria-labelledby`, so a heading rendered outside the component is never associated.
- **Asserting on `textContent` picks up a stray `x`.** Base UI's Meter.Root always appends a visually hidden `<span role="presentation">x</span>`; a screen reader ignores it and it never joins the accessible name. Query the specific node instead of reading the whole tree.
- **A `value` outside `[min, max]` clamps the text to 0-100%**, while `aria-valuenow` still reports the raw value. Out-of-range data is yours to fix; the component does not paper over it.

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
