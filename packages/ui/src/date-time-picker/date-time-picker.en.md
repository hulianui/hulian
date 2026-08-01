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

> Before 0.15.0 this component bridged to MUI X `DateTimePicker` and required four optional peer dependencies plus `MuiBridgeProvider`.
> The current implementation is dependency-free and no longer requires that provider.

## Import
```ts
import { DateTimePicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| null` | — | Controlled value, `"YYYY-MM-DD HH:mm"` (`withSeconds` with seconds), with a space in the middle |
| defaultValue | `string \| null` | — | Uncontrolled initial value, the shape is the same as above |
| withSeconds | `boolean` | `false` | Shows the seconds column and changes the value shape to include seconds. |
| minuteStep | `number` | `1` | Minute column step (commonly used 5 / 15 / 30) |
| secondStep | `number` | `1` | second column step |
| minDateTime | `string` | — | The earliest selectable time (inclusive), the shape is the same as `value`. The date part restricts the calendar, and the time part only takes effect on the boundary day. |
| maxDateTime | `string` | — | Latest selectable time (inclusive) |
| disabledDate | `(isoDate: string) => boolean` | — | Disables dates. The argument is always `"YYYY-MM-DD"`; this callback does not filter times. |
| placeholder | `string` | `"\u9009\u62e9\u65e5\u671f\u65f6\u95f4"` | Trigger placeholder; the built-in Chinese copy means “Select date and time.” |
| displayFormat | `string` | Display as is | Trigger display format (dayjs format string). **Only affects display**, the shape of external values remains unchanged |
| clearable | `boolean` | `true` | Display the clear button when it has a value and is not disabled/readOnly |
| showNow | `boolean` | `true` | Shows a shortcut with built-in Chinese copy `"\u6b64\u523b"` (Now), rounded down to the configured step. |
| disabled | `boolean` | `false` | Disables the trigger and prevents the panel from opening. |
| readOnly | `boolean` | `false` | Allows the panel to open but prevents selection. |
| aria-label | `string` | — | Accessible name for an unlabeled trigger. |
| className | `string` | — | Additional class name for the outer trigger container. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | Called with the selected value, or `null` when cleared. |

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
