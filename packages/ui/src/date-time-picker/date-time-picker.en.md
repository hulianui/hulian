---
slug: date-time-picker
name: DateTimePicker
category: forms
group: datetime
tags: []
exports: [DateTimePicker]
status: enriched
---

# DateTimePicker

> Date-time picker · Dependency-free Calendar with hour/minute/second columns, step controls, optional seconds, Now action, boundary-day time limits, and fixed-width values · forms/datetime

## When to use

Use DateTimePicker when one field must capture both a day and a time, such as a meeting, deadline, or shift boundary. The popup places [Calendar](../calendar/calendar.md) on the left and time columns on the right; each side can be adjusted independently.

Use [DatePicker](../date-picker/date-picker.md) for date only, [TimePicker](../time-picker/time-picker.md) for column-based time selection, or [TimeField](../time-field/time-field.md) for keyboard entry. Two separate fields are often easier to complete, so use the combined control only when the workflow benefits from it.

> This component was a bridge component of MUI X `DateTimePicker` before 0.15.0. Four optional peers must be installed and mounted
> `MuiBridgeProvider`. Now it is self-developed with zero dependencies, and it can be used immediately after installing the library.

## Import
```ts
import { DateTimePicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| null` | — | Controlled value, `"YYYY-MM-DD HH:mm"` (`withSeconds` with seconds), with a space in the middle |
| defaultValue | `string \| null` | — | Uncontrolled initial value, the shape is the same as above |
| withSeconds | `boolean` | `false` | Displays the seconds column, and the value shape follows the seconds |
| minuteStep | `number` | `1` | Minute column step (commonly used 5 / 15 / 30) |
| secondStep | `number` | `1` | second column step |
| minDateTime | `string` | — | The earliest selectable time (inclusive), the shape is the same as `value`. The date part restricts the calendar, and the time part only takes effect on the boundary day. |
| maxDateTime | `string` | — | Latest selectable time (inclusive) |
| disabledDate | `(isoDate: string) => boolean` | — | Disable daily judgment, the input parameter is always `"YYYY-MM-DD"`, **only screen the date but not the time** |
| placeholder | `string` | `"Select date time"` | Trigger placeholder text |
| displayFormat | `string` | Display as is | Trigger display format (dayjs format string). **Only affects display**, the shape of external values remains unchanged |
| clearable | `boolean` | `true` | Display the clear button when it has a value and is not disabled/readOnly |
| showNow | `boolean` | `true` | "At this moment" shortcut at the bottom of the panel (round down and align by step) |
| disabled | `boolean` | `false` | The whole screen is grayed out and the panel cannot be opened. |
| readOnly | `boolean` | `false` | The panel can be viewed but cannot be selected |
| aria-label | `string` | — | Trigger accessibility name (given when there is no visible label) |
| className | `string` | — | falls on the outer container of the trigger |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | Select/clear callback; clear callback `null` |

## Examples
```tsx
// Basic
<DateTimePicker defaultValue="2026-06-08 09:30" />

// Controlled
const [dt, setDt] = useState<string | null>(null);
<DateTimePicker value={dt} onValueChange={setDt} />

// Include seconds and use 15-minute steps
<DateTimePicker withSeconds minuteStep={15} defaultValue="2026-06-08 09:30:00" />

// Bounded range: date limits apply throughout; time limits apply only on boundary dates
<DateTimePicker
  defaultValue="2026-06-10 12:00"
  minDateTime="2026-06-08 09:30"
  maxDateTime="2026-06-20 18:00"
/>
```

## Usage guidelines

- **The value is fixed-width text, not `Date` or an ISO timestamp:** `"YYYY-MM-DD HH:mm"`, with a space between date and time. Lexical order matches chronological order without timezone conversion. Migrate full ISO timestamps when upgrading from the pre-0.15.0 MUI version.
- **The time portion of `minDateTime` and `maxDateTime` applies only on the boundary date.** Interior dates allow the full day. For example, a minimum of June 8 at 09:30 must not disable June 9 at 00:00.
- **Selecting a date does not close the popup.** The user still needs to choose a time; click OK or outside the popup to close it.
- When only the date is selected without touching the time column, the time is supplemented by `00:00` (if it is pushed by `minDateTime`, it is supplemented by the earliest selectable time of the day).
- If the user chooses a time before a date, the date defaults to **today** so the action produces a usable value.
- `disabledDate` only filters dates. If you want to disable selection based on the granularity of "a certain period of the day of the week", this component cannot do it.
  You need to verify it yourself when submitting.
- `minuteStep` limits clickable minute options but does not validate an external `value`. With `"2026-06-08 09:07"` and `minuteStep={15}`, 07 is absent and the minute column appears unselected.

## Related
[DatePicker](../date-picker/date-picker.md) · [Calendar](../calendar/calendar.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Scheduler](../scheduler/scheduler.md)
