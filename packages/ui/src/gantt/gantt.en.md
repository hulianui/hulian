---
slug: gantt
name: Gantt
category: data-display
group: collection
tags: []
exports: [Gantt]
status: enriched
---

# Gantt

> Read-only Gantt chart · grouped fixed name column, day/week/month timeline, proportional task bars, progress fill, today marker, UTC date arithmetic, and horizontal scrolling · data-display/collection

## When to use

Use Gantt to present a project or process schedule with progress. It is read-only. Use Scheduler to drag-edit timed events, or Flow to show dependencies.

## Import
```ts
import { Gantt } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLDivElement>` except children.

| Name | Type | Default | Description |
|------|------|------|------|
| tasks* | `GanttTask[]` | — | Read-only task list. |
| rangeStart | `string` | — | `"YYYY-MM-DD"` axis start; omission pads before the earliest task. |
| rangeEnd | `string` | — | `"YYYY-MM-DD"` axis end; omission pads after the latest task. |
| unit | `"day" \| "week" \| "month"` | `"day"` | Header tick density; weeks start Monday and bars keep the same geometry. |
| today | `string` | — | `"YYYY-MM-DD"` today marker, rendered only within range. |
| rowHeight | `number` | `36` | Row height in pixels. |
| className | `string` | — | Root class name. |

`GanttTask` is `{id, name, start, end, progress?, group?, color?}`. Dates are inclusive `"YYYY-MM-DD"` values, progress is 0–100, matching groups receive headings, and color accepts CSS colors or tokens.

## Example
```tsx
const tasks: GanttTask[] = [
  { id: "t1", name: "Site survey", start: "2026-06-01", end: "2026-06-05", progress: 100, group: "Planning" },
  { id: "t3", name: "Main construction", start: "2026-06-08", end: "2026-06-24", progress: 60, group: "Build" },
  { id: "t5", name: "Final inspection", start: "2026-07-01", end: "2026-07-06", progress: 0, group: "Closeout" },
];

<Gantt tasks={tasks} unit="week" today="2026-06-18" />
```

## Usage notes

- Dates are inclusive and parsed with UTC arithmetic. Do not pass timestamps or timezone offsets; those belong in Scheduler.
- Token colors need full names such as `var(--color-chart-2)`; see [[hulian-token-color-var-needs-color-prefix]].
- The timeline can exceed its container. Give the outer layout a definite responsive width so horizontal scrolling can appear.
- Built-in Chinese copy includes `"\u6682\u65e0\u6392\u671f\u6570\u636e"` (“No schedule data”), `"\u9879\u76ee\u6392\u671f\u7518\u7279\u56fe"` (“Project schedule Gantt chart”), `"\u5de5\u5e8f"` (“Task”), and month labels `"1\u6708"` through `"12\u6708"` (“January” through “December”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
