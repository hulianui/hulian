---
slug: time-field
name: TimeField
category: forms
group: datetime
tags: []
exports: [TimeField]
status: enriched
---

# TimeField

> Segmented time input · dependency-free hour/minute/second spinbuttons + arrow navigation + two-digit overwrite + min/max clamping · fixed-width `HH:mm[:ss]` values · forms/datetime

## When to use

Use TimeField in keyboard-heavy schedules, attendance forms, or bulk edits where many times are entered on one screen. Users can type `14` then `30` without opening a popup.

Use [TimePicker](../time-picker/time-picker.md) for popup-based selection with `minuteStep` and a Now shortcut, or [DateTimePicker](../date-time-picker/date-time-picker.md) when date and time are selected together.

> Before 0.15.0 this component bridged to MUI X `TimeField` and required four optional peer dependencies plus `MuiBridgeProvider`.
> The current dependency-free implementation also supports min/max bounds and seconds.

## Import
```ts
import { TimeField } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| null` | — | Controlled value in zero-padded 24-hour `"HH:mm"` or `"HH:mm:ss"` format, depending on `withSeconds`. |
| defaultValue | `string \| null` | — | Initial value in uncontrolled mode, with the same shape as `value`. |
| withSeconds | `boolean` | `false` | Whether to show the seconds segment and include seconds in the value. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Field size, on the same scale as [Input](../input/input.md) (32 / 40 / 48px), so controls on one form row line up. |
| minTime | `string` | — | Earliest allowed time, inclusive, with the same shape as `value`. |
| maxTime | `string` | — | Latest allowed time, inclusive. |
| clearable | `boolean` | `true` | Whether to show a clear button when the field has a value and is neither disabled nor read-only. |
| disabled | `boolean` | `false` | Disables the field and prevents its segments from receiving focus. |
| readOnly | `boolean` | `false` | Prevents value changes while preserving segment navigation. |
| aria-label | `string` | From `ConfigProvider locale` | Accessible group name. An explicit value overrides the locale default; segment labels also follow the locale. |
| className | `string` | — | Additional class name for the outer container. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | **Triggered only after every required segment is complete**; clearing the value returns `null`. |

## Localization

The group, hour/minute/second segments, empty-value announcement, and clear
action follow the nearest `ConfigProvider locale`. An explicit `aria-label`
takes precedence. A legacy custom locale without `components.timeField`
retains the original Chinese compatibility labels.

## Keyboard

| Key | Action |
|------|------|
| `↑` / `↓` | Increment or decrement the active segment, wrapping within its range (23 → 0). In an empty segment, `↑` starts at the minimum and `↓` at the maximum. |
| `←` / `→` | Move between segments without wrapping past either end. |
| `0`–`9` | Replaces the current segment through a two-digit buffer and advances after two digits. If the first digit cannot begin a valid two-digit value (for example `3` for hours), it commits that one digit immediately. |
| `Backspace` / `Delete` | Clear the active segment. |

## Example
```tsx
// Basic
<TimeField defaultValue="09:30" />

// Controlled
const [time, setTime] = useState<string | null>(null);
<TimeField value={time} onValueChange={setTime} />

// With seconds
<TimeField withSeconds defaultValue="09:30:15" />

// Range limits are applied only after every segment is complete
<TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" />
```

## Usage guidelines

- **Partial times do not emit.** `onValueChange` fires only after every required segment is complete; intermediate editing state remains internal by design.
- **`minTime` and `maxTime` clamp only after the complete value is entered.** Segment-level clamping would block valid entry sequences before later segments exist. The tradeoff is that a completed `23:00` may visibly clamp to `18:00`.
- **An invalid second digit restarts the segment with that digit instead of clamping.** Typing `2`, then `9` for hours produces `09`; inventing `23` would not reflect what the user entered.
- Boundary values are normalized to the active shape. With `withSeconds`, `maxTime="18:00"` means `18:00:00`, not every time through `18:00:59`.
- Segments use `<span role="spinbutton">`, not three inputs, to preserve custom two-digit buffering without browser IME, autofill, and validation interference. The component therefore **does not participate in native form submission**; collect its value through controlled state.
- `readOnly` still permits `←`/`→` segment navigation for inspection, while arrows that change values and numeric keys are disabled.

## Related
[TimePicker](../time-picker/time-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [DatePicker](../date-picker/date-picker.md) · [Calendar](../calendar/calendar.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [InputOtp](../input-otp/input-otp.md)
