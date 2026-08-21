---
slug: timeline
name: Timeline
category: data-display
group: stat
tags: []
exports: [Timeline, TimelineItem]
status: enriched
---

# Timeline

> Orders events along a timeline with colored or custom markers, alternate placement, and a pending state.

## When to use

Use Timeline for chronological approvals, shipment tracking, or activity history. Use GitCommit for one commit reference or Steps for a user-progressed sequence.

## Import
```ts
import { Timeline, TimelineItem } from "@hulianui/ui"
```

## Props

### Timeline

| Name | Type | Default | Description |
|------|------|------|------|
| items | `TimelineItemProps[]` | - | Data-driven items equivalent to `<TimelineItem {...item} />`; exclusive with children. |
| mode | `"left" \| "right" \| "alternate"` | `"left"` | Left nodes, mirrored right nodes, or alternating content around a center line. |
| …HTMLAttributes | `Omit<HTMLAttributes<HTMLOListElement>, "children">` | - | Forwarded ordered-list attributes. |

### TimelineItem

| Name | Type | Default | Description |
|------|------|------|------|
| color | `"default" \| "primary" \| "success" \| "danger" \| "warning"` | `"default"` | Default dot tone; ignored with a custom dot. |
| pending | `boolean` | `false` | Shows a spinning pending ring and makes the incoming connector dashed. |
| className | `string` | - | Custom class name. |

## Slots

### Timeline

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Compound TimelineItem children; exclusive with items. |
| pending | `boolean \| ReactNode` | Appends a pending ghost item; true shows only the spinner, or supply content. |

### TimelineItem

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Primary event content. |
| dot | `ReactNode` | Custom node such as an icon, replacing the colored dot. |
| label | `ReactNode` | Muted timestamp or metadata below the main content. |

## Examples
```tsx
// Data-driven approval flow
const approval = [
  { label: "09:12", children: "Employee submitted expense request", color: "primary" },
  { label: "10:40", children: "Manager approved", color: "success" },
];
<Timeline items={approval} pending="Finance review" />

// Compound items with a custom node
<Timeline>
  <TimelineItem label="Step one" color="success" dot={CheckIcon}>Account created</TimelineItem>
  <TimelineItem label="Step two" color="primary">Connect payout account</TimelineItem>
</Timeline>
```

## Pitfalls
- Choose `items` or `children`, not both.
- `label` is secondary metadata below the body; do not place primary content there.
- A custom `dot` replaces the default dot and makes `color` ineffective.

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
