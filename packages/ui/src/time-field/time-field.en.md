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
| value | `string \| null` | — | Controlled value, `"HH:mm"` or `"HH:mm:ss"` (with `withSeconds`). 24-hour format, fixed width zero padding |
| defaultValue | `string \| null` | — | Uncontrolled initial value, the shape is the same as above |
| withSeconds | `boolean` | `false` | Displays the seconds segment, and the value shape is accompanied by seconds. |
| minTime | `string` | — | The earliest selectable time (inclusive), the shape is the same as `value` |
| maxTime | `string` | — | Latest selectable time (inclusive) |
| clearable | `boolean` | `true` | Display the clear button when it has a value and is not disabled/readOnly |
| disabled | `boolean` | `false` | Disables the field and prevents its segments from receiving focus. |
| readOnly | `boolean` | `false` | Prevents value changes while preserving segment navigation. |
| aria-label | `string` | `"\u65f6\u95f4"` | Accessible name; the built-in Chinese copy means “Time.” Segment labels are also built-in Chinese copy meaning hour, minute, and second. |
| className | `string` | — | Additional class name for the outer container. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | **Triggered only after every required segment is complete**; clearing the value returns `null`. |

## Keyboard

| button | effect |
|------|------|
| `↑` / `↓` | Current segment ±1, loop within segment (23 → 0). Empty segment starts: `↑` is the smallest, `↓` is the largest |
| `←` / `→` | Switch segments without crossing the boundary at both ends |
| `0`–`9` | Replaces the current segment through a two-digit buffer and advances after two digits. If the first digit cannot begin a valid two-digit value (for example `3` for hours), it commits that one digit immediately. |
| `Backspace` / `Delete` | Clear current segment |

## Example
```tsx
// Basic
<TimeField defaultValue="09:30" />

// Controlled
const [time, setTime] = useState<string | null>(null);
<TimeField value={time} onValueChange={setTime} />

// With seconds
<TimeField withSeconds defaultValue="09:30:15" />

// Limited interval (clamped only after the entire section is input)
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
