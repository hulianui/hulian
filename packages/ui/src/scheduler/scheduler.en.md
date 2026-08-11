---
slug: scheduler
name: Scheduler
category: data-display
group: collection
tags: []
exports: [Scheduler, dateOf, dayColumns, eventRect, hourLines, layoutColumns, minutesOfDay, minutesToISO, monthMatrix, resourceColumns, snap, startOfWeekISO, weekColumns, yToMinutes]
status: enriched
---

# Scheduler

> Event calendar and scheduling workspace · month, week, day, and resource views with overlapping event layout, current-time line, native drag-create, move, resize, slot snapping, controlled state, toolbar, and exported geometry helpers · data-display/collection

## When to use

Use Scheduler for appointments, clinic rosters, or resource timelines where users create slots, move events, and resize duration. Use Gantt for a read-only project schedule or Calendar/DatePicker for date selection.

## Import
```ts
import { Scheduler, dateOf, dayColumns, eventRect, hourLines, layoutColumns, minutesOfDay, minutesToISO, monthMatrix, resourceColumns, snap, startOfWeekISO, weekColumns, yToMinutes } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| events* | `SchedulerEvent[]` | — | Controlled `{id, title, start, end, resourceId?, tone?, subtitle?}` events using local ISO datetimes. |
| view* | `"month" \| "week" \| "day" \| "resource"` | — | Controlled view. |
| date* | `string` | — | Controlled ISO focus date. |
| now | `string \| Date` | Browser clock, read after mount | Reference point for "today" and the current-time line. The component **never reads the system clock during render**, so the first frame has no today highlight and no current-time line; both appear after mount. Passing a value takes over completely, which is what makes screenshot regressions reproducible and lets "today" follow a server business clock instead of the user's machine. |
| resources | `SchedulerResource[]` | — | Required in resource view: `{id, title, subtitle?}`. |
| dayStartHour | `number` | `8` | Timeline start hour. |
| dayEndHour | `number` | `20` | Timeline end hour. |
| slotMinutes | `number` | `30` | Drag and create snap interval in minutes. |
| hourHeight | `number` | `56` | Pixels per hour. |
| toolbar | `boolean` | `true` | Shows title, previous/today/next controls, and view selector. |
| className | `string` | — | Root class; establish a definite height for scrolling. |

`SchedulerEvent.tone` is `"primary" | "success" | "warning" | "danger" | "neutral"`, defaulting to primary.

## Events

| Event | Type | Description |
|------|------|------|
| onViewChange | `(v: SchedulerView) => void` | View selection. |
| onDateChange | `(iso: string) => void` | Focus-date change from navigation or month-day selection. |
| onEventsChange | `(events: SchedulerEvent[]) => void` | Returns the complete array after move or resize. |
| onSlotDragCreate | `(slot: SchedulerSlot) => void` | Reports a dragged blank time range. |
| onSlotClick | `(slot: SchedulerSlot) => void` | Reports a clicked blank slot. |
| onEventClick | `(event: SchedulerEvent) => void` | Reports an event click. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderEvent | `(event: SchedulerEvent) => ReactNode` | Custom event content while Scheduler owns geometry and drag handles. |

## Example
```tsx
const [events, setEvents] = useState<SchedulerEvent[]>(INITIAL);
const [view, setView] = useState<SchedulerView>("week");
const [date, setDate] = useState("2026-06-15");

<div className="h-[520px] w-full">
  <Scheduler
    className="h-full"
    events={events}
    view={view}
    date={date}
    resources={resources}
    onViewChange={setView}
    onDateChange={setDate}
    onEventsChange={setEvents}
    onSlotDragCreate={(slot) =>
      setEvents((prev) => [
        ...prev,
        { id: `n-${slot.start}`, title: "New appointment", start: slot.start, end: slot.end, resourceId: slot.resourceId ?? "d1", tone: "primary" },
      ])
    }
  />
</div>
```

## Usage notes

- **The clock is never read during render.** Under SSR or static export the server render happens at build time and the first client render happens at visit time; once they cross a day boundary they compute a different "today" and hydration fails (React #418). The component therefore defers "now" to after mount, so the first frame has no today highlight and no current-time line. When copying the examples, do not move `dayjs()` back to module scope or into the render body — `useMemo(fn, [])` does not help, because it only stabilizes a single render tree. Pass `now` when you need determinism.

- Events, view, and date are fully controlled. Write `onEventsChange` back to state or dragged changes snap back.
- The host needs a definite height so the time grid can fill it and scroll internally.
- Tone accepts only five semantic values; use `renderEvent` for arbitrary color.
- Start and end are local ISO datetimes with time, unlike Gantt's inclusive date-only values.
- Toolbar actions, view names, weekdays, formatted titles, and the overflow label read `ConfigProvider`'s `locale.components.scheduler`. `zhCN` and `enUS` include the dictionary; legacy custom locales that omit this optional field retain the Chinese fallback.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
