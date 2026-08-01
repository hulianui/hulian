---
slug: time-picker
name: TimePicker
category: forms
group: datetime
tags: []
exports: [TimePicker]
status: enriched
---

# TimePicker

> Time picker · dependency-free hour/minute/second popup columns + step and range-aware disabling · fixed-width `HH:mm[:ss]` values · forms/datetime

## When to use

Use TimePicker for popup-based time selection in schedules, reservations, or business hours. Step sizes and the Now shortcut work well when choices should align to whole or half hours.

Use [TimeField](../time-field/time-field.md) for keyboard-first segmented input, [DateTimePicker](../date-time-picker/date-time-picker.md) for a combined date and time, or [DatePicker](../date-picker/date-picker.md) for a date only.

## Import
```ts
import { TimePicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| null` | — | Controlled value, `"HH:mm"` or `"HH:mm:ss"` (with `withSeconds`), 24-hour wide zero padding |
| defaultValue | `string \| null` | — | Uncontrolled initial value, the shape is the same as above |
| withSeconds | `boolean` | `false` | The seconds column is displayed and the value shape becomes `"HH:mm:ss"` |
| minuteStep | `number` | `1` | Minute column step (5 / 15 / 30 commonly used) |
| secondStep | `number` | `1` | second column step |
| minTime | `string` | — | The earliest selectable time (inclusive), the shape is the same as `value` |
| maxTime | `string` | — | Latest selectable time (inclusive) |
| placeholder | `string` | `"\u9009\u62e9\u65f6\u95f4"` | Trigger placeholder; the built-in Chinese copy means “Select time.” |
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

## Example
```tsx
<TimePicker defaultValue="09:30" />

// With seconds
<TimePicker withSeconds defaultValue="09:30:15" />

// 15-minute increments
<TimePicker minuteStep={15} defaultValue="09:30" />

// Business hours window
<TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" />
```

Another set of pure functions is exported for direct reuse in form verification (no need to parse the time string again):

```ts
import { parseTime, formatTimeParts, clampTime, snapToStep } from "@hulianui/ui"

parseTime("9:5")                       // { h: 9, m: 5, s: 0 }; illegal/out of bounds return null
formatTimeParts({h:9,m:5,s:0}, false)  // "09:05"
clampTime({h:8,m:0,s:0}, false, "09:30")  // { h: 9, m: 30, s: 0 }
snapToStep({h:9,m:37,s:0}, 15)            // { h: 9, m: 30, s: 0 }
```

> The `Parts` in the name is to avoid the `formatTime` occupied by [Video](../video/video.md) (which is "seconds → mm:ss").

## Usage guidelines

- **Values are fixed-width strings, not `Date` objects.** Lexical order of `"HH:mm[:ss]"` matches time order, so bounds compare directly without timezone effects. Add a date explicitly if the application needs a `Date`.
- **A column option is disabled only when its entire interval falls outside the range.** With `minTime="09:30"`, hour 09 remains available because 09:30–09:59 is valid, while minute values before 30 are disabled when hour 09 is active.
- **An empty picker uses `clamp(00:00:00, [min,max])` as its working base.** With `minTime="09:30"`, this keeps the minute column usable even before the user selects an hour.
- `minuteStep` changes only the **candidate list**; it does not validate external values. With `minuteStep={15}`, `value="09:37"` has no matching minute item and is not highlighted. Call `snapToStep` first when alignment is required.
- Switching `withSeconds` changes the external value shape (`"09:30"` ↔ `"09:30:15"`). Normalize stored values when switching modes.
- TimePicker and [TimeField](../time-field/time-field.md) share the same fixed-width `"HH:mm[:ss]"` format, so applications can switch between popup and keyboard interactions without converting values.

## Related
[TimeField](../time-field/time-field.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Calendar](../calendar/calendar.md) · [Scheduler](../scheduler/scheduler.md)
