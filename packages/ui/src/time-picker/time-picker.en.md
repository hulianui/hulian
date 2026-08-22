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

> Selects a time from hour and minute option controls. · forms/datetime

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
| value | `string \| null` | - | Controlled value in zero-padded 24-hour `"HH:mm"` or `"HH:mm:ss"` format, depending on `withSeconds`. |
| defaultValue | `string \| null` | - | Initial value in uncontrolled mode, with the same shape as `value`. |
| withSeconds | `boolean` | `false` | Whether to show the seconds column and include seconds in the value. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size, on the same scale as [Input](../input/input.md) (32 / 40 / 48px), so controls on one form row line up. |
| minuteStep | `number` | `1` | Increment between minute options; 5, 15, and 30 are common choices. |
| secondStep | `number` | `1` | Increment between second options. |
| minTime | `string` | - | Earliest selectable time, inclusive, with the same shape as `value`. |
| maxTime | `string` | - | Latest selectable time, inclusive. |
| placeholder | `string` | `"\u9009\u62e9\u65f6\u95f4"` | Trigger placeholder; the built-in Chinese copy means “Select time.” |
| clearable | `boolean` | `true` | Whether to show a clear button when the picker has a value and is neither disabled nor read-only. |
| showNow | `boolean` | `true` | Shows a shortcut with built-in Chinese copy `"\u6b64\u523b"` (Now), rounded down to the configured step. |
| disabled | `boolean` | `false` | Disables the trigger and prevents the panel from opening. |
| readOnly | `boolean` | `false` | Allows the panel to open but prevents selection. |
| aria-label | `string` | - | Accessible name for an unlabeled trigger. |
| className | `string` | - | Additional class name for the outer trigger container. |

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

The package also exports pure functions for form validation, so consumers do not need to parse the time string again:

```ts
import { parseTime, formatTimeParts, clampTime, snapToStep } from "@hulianui/ui"

parseTime("9:5")                       // { h: 9, m: 5, s: 0 }; invalid/out-of-range input returns null
formatTimeParts({h:9,m:5,s:0}, false)  // "09:05"
clampTime({h:8,m:0,s:0}, false, "09:30")  // { h: 9, m: 30, s: 0 }
snapToStep({h:9,m:37,s:0}, 15)            // { h: 9, m: 30, s: 0 }
```

> The `Parts` suffix avoids a collision with [Video](../video/video.md)'s existing `formatTime`, which converts seconds to `mm:ss`.

## Usage guidelines

- **Values are fixed-width strings, not `Date` objects.** Lexical order of `"HH:mm[:ss]"` matches time order, so bounds compare directly without timezone effects. Add a date explicitly if the application needs a `Date`.
- **A column option is disabled only when its entire interval falls outside the range.** With `minTime="09:30"`, hour 09 remains available because 09:30-09:59 is valid, while minute values before 30 are disabled when hour 09 is active.
- **An empty picker uses `clamp(00:00:00, [min,max])` as its working base.** With `minTime="09:30"`, this keeps the minute column usable even before the user selects an hour.
- `minuteStep` changes only the **candidate list**; it does not validate external values. With `minuteStep={15}`, `value="09:37"` has no matching minute item and is not highlighted. Call `snapToStep` first when alignment is required.
- Switching `withSeconds` changes the external value shape (`"09:30"` ↔ `"09:30:15"`). Normalize stored values when switching modes.
- TimePicker and [TimeField](../time-field/time-field.md) share the same fixed-width `"HH:mm[:ss]"` format, so applications can switch between popup and keyboard interactions without converting values.
- The trigger is a `role="combobox"` button, and native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, `onBlur`, ...) land on **it** rather than on the outer container, which is the element that takes focus and that screen readers announce (#315).
- Inside [Field](../field/field.md) the label's `htmlFor`, `aria-describedby`, `invalid`, and `disabled` are wired to the trigger automatically, and so is the `aria-required` injected by `<Field required>`. **That chain was broken until #315** (the label pointed at an id that did not exist, so screen readers never announced the field name); upgrading needs no call-site change.
- Query the trigger by role with `getByRole("combobox")` in tests, not `"button"` anymore. `combobox` is not a name-from-content role, so the accessible name comes from `aria-label` or the `Field` label rather than from the time text shown on the trigger.

## Related
[TimeField](../time-field/time-field.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [Calendar](../calendar/calendar.md) · [Scheduler](../scheduler/scheduler.md)
