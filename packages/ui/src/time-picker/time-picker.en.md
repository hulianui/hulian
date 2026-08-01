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

To input without taking your hands off the keyboard, use [TimeField](../time-field/time-field.md) (segmented input, no floating layer).
Select [DateTimePicker](../date-time-picker/date-time-picker.md) together with the date;
Use [DatePicker](../date-picker/date-picker.md) to select only dates.

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
| placeholder | `string` | `"Select time"` | Trigger placeholder. |
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
- **The criterion for column-by-column disabling is "whether the entire segment intersects with the range", not "whether the endpoint crosses the boundary"**: `minTime="09:30"`
The 9 o'clock box is still available** (9:30~9:59 is accessible), and the minutes before 30 minutes within 9 o'clock are prohibited.
If you write it as "the endpoint is banned when it crosses the boundary", the entire 9 points will be banned by mistake.
- **There is an implicit base when no value has been selected**: `clamp(00:00:00, [min,max])`. If you don’t do this `minTime="09:30"`
The base hour is always 0, the minute column will be blocked by the whole column, and the panel will look broken. So "click minutes and then hours" will also work.
- `minuteStep` changes only the **candidate list**; it does not validate external values. With `minuteStep={15}`, `value="09:37"` has no matching minute item and is not highlighted. Call `snapToStep` first when alignment is required.
- `withSeconds` switching will change the external value shape (`"09:30"` ↔ `"09:30:15"`). Please process the stock value when switching.
- TimePicker and [TimeField](../time-field/time-field.md) share the same fixed-width `"HH:mm[:ss]"` format, so applications can switch between popup and keyboard interactions without converting values.

## Related
[TimeField](../time-field/time-field.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Calendar](../calendar/calendar.md) · [Scheduler](../scheduler/scheduler.md)
