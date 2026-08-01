---
slug: date-range-picker
name: DateRangePicker
category: forms
group: datetime
tags: []
exports: [DateRangePicker]
status: enriched
---

# DateRangePicker

> Date range picker · Dependency-free two-month calendar in a Popover, with presets, bounds, `disabledDate`, and controlled ISO string arrays · forms/datetime

## When to use

Use DateRangePicker to select a **start and end date** with two months shown side by side and presets for Today, Last 7 Days, Last 30 Days, and This Month. Use [DatePicker](../date-picker/date-picker.md) for one date, [DateTimePicker](../date-time-picker/date-time-picker.md) for date and time, or [Calendar](../calendar/calendar.md) for an always-visible month panel. The HulianUI date family has no external date-picker dependency and uses fixed-width string values.

## Import
```ts
import { DateRangePicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `[string, string] \| null` | — | Controlled value `[start, end]` (ISO `YYYY-MM-DD`); `null` = cleared; controlled when passed in |
| defaultValue | `[string, string] \| null` | — | uncontrolled initial value |
| minDate | `string` | — | The earliest selectable date (ISO), any date earlier than this is prohibited. |
| maxDate | `string` | — | The latest selectable date (ISO), no selection later than this date |
| disabledDate | `(isoDate: string) => boolean` | — | Customize to disable a certain day, the input parameter is ISO `YYYY-MM-DD` |
| presets | `boolean \| DateRangePreset[]` | `true` | Quick preset: `true`/omitted = default four items; array = custom; `false` = hidden |
| placeholder | `[string, string]` | `["start date","end date"]` | Placeholder copy [start, end] |
| displayFormat | `string` | `"YYYY-MM-DD"` | Display format (dayjs format); the external controlled value is always ISO `YYYY-MM-DD` |
| disabled | `boolean` | `false` | Disable |
| readOnly | `boolean` | `false` | Read only: can be opened for viewing, no endpoint selection/no preset/no clearing |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(range: [string, string] \| null) => void` | Interval changes (including clearing → null) |

`DateRangePreset`: `{ label: string; getValue: () => [string, string] }`, called when clicked, can be dynamically calculated based on "today".

## Examples
```tsx
function Demo() {
  const [v, setV] = useState<[string, string] | null>(null);
  return <DateRangePicker value={v} onValueChange={setV} />;
}
```
```tsx
<DateRangePicker
  defaultValue={["2026-06-10", "2026-06-12"]}
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6; // Disable weekends
  }}
/>
```

## Usage guidelines

- Choose controlled or uncontrolled usage. Pair `value` with `onValueChange`; use `defaultValue` only for an uncontrolled initial range, and do not pass both.
- The external value is always an array of ISO `YYYY-MM-DD` strings, not Date objects. `displayFormat` changes presentation only.
- `disabledDate` receives an ISO date string. For weekday calculations, use `new Date(iso + "T00:00:00")` and account for the local timezone. Avoid `new Date(iso)`, which parses as UTC and can shift the calendar day.

## Related
[Calendar](../calendar/calendar.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimeField](../time-field/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
