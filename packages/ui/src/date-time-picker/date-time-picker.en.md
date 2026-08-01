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

> Date and time picker · Calendar plus hour, minute, and optional second columns · Step controls and boundary-aware limits · forms/datetime

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
| value | `string \| null` | — | Controlled fixed-width value: `"YYYY-MM-DD HH:mm"`, or `"YYYY-MM-DD HH:mm:ss"` with seconds enabled. |
| defaultValue | `string \| null` | — | Initial value when uncontrolled, using the same format as `value`. |
| withSeconds | `boolean` | `false` | Shows the seconds column and changes the value shape to include seconds. |
| minuteStep | `number` | `1` | Increment between minute options; common values are 5, 15, and 30. |
| secondStep | `number` | `1` | Increment between second options. |
| minDateTime | `string` | — | Earliest selectable date and time, inclusive. Its date limits the calendar; its time applies only on that boundary date. |
| maxDateTime | `string` | — | Latest selectable date and time, inclusive, with the same boundary-date behavior. |
| disabledDate | `(isoDate: string) => boolean` | — | Disables dates. The argument is always `"YYYY-MM-DD"`; this callback does not filter times. |
| placeholder | `string` | `"\u9009\u62e9\u65e5\u671f\u65f6\u95f4"` | Trigger placeholder; the built-in Chinese copy means “Select date and time.” |
| displayFormat | `string` | Display as is | Day.js format string used by the trigger. It affects presentation only; the external value format does not change. |
| clearable | `boolean` | `true` | Shows a clear button when a value exists and the control is neither disabled nor read-only. |
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
- If the user selects a date without choosing a time, the component supplies `00:00`, or the earliest allowed time when `minDateTime` constrains that date.
- If the user chooses a time before a date, the date defaults to **today** so the action produces a usable value.
- `disabledDate` filters whole dates only. Validate more granular rules, such as a blocked time window on certain weekdays, when the form is submitted.
- `minuteStep` limits clickable minute options but does not validate an external `value`. With `"2026-06-08 09:07"` and `minuteStep={15}`, 07 is absent and the minute column appears unselected.

## Related
[DatePicker](../date-picker/date-picker.md) · [Calendar](../calendar/calendar.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Scheduler](../scheduler/scheduler.md)
