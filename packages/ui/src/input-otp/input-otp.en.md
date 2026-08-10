---
slug: input-otp
name: InputOTP
category: forms
group: advanced
tags: []
exports: [InputOTP]
status: enriched
---

# InputOTP

> One-time code input · Fixed-length segmented fields with automatic advance, Backspace behavior, full-code paste, and zero dependencies · forms/advanced

## When to use

Use InputOTP for fixed-length SMS or email codes, PINs, and two-factor codes. It handles segment focus, Backspace, full-code paste and splitting, and `onComplete`; do not recreate this with separate text inputs and regular expressions. Use Input or [SecretField](../secret-field/secret-field.md) for unrestricted text.

## Import
```ts
import { InputOTP } from "@hulianui/ui"
```

## Props

Inherits the native attributes of the root `role="group"` element, so `id`, `data-*`, `aria-*`, `onFocus`, and `onBlur` can all be passed directly.

| Name | Type | Default | Description |
|------|------|------|------|
| length | `number` | `6` | number of segments |
| value | `string` | — | controlled value |
| defaultValue | `string` | `""` | Uncontrolled initial value. |
| type | `"numeric" \| "text"` | `"numeric"` | Numbers only (default) or any characters |
| disabled | `boolean` | `false` | Disables the control. |
| invalid | `boolean` | `false` | Verification failed status |
| groupGap | `boolean` | `false` | Inserts a separator in the middle for a 3–3 grouping such as XXX–XXX. |
| name | `string` | — | Submission name. Renders an extra hidden input holding the complete value, because the segments each hold a single character and would otherwise submit N separate fields. |
| className | `string` | — | Container class name |
| aria-label | `string` | `"\u9a8c\u8bc1\u7801"` | Accessible name; the built-in Chinese copy means “Verification code.” |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(value: string) => void` | value change callback |
| onComplete | `(value: string) => void` | Callback when full |
| onBlur | `(e: FocusEvent<HTMLDivElement>) => void` | Fires when focus leaves the whole group; moving between segments does not count. Pass `field.onBlur` here when using a react-hook-form `Controller`. |

## Examples
```tsx
const [otp, setOtp] = useState("");
<InputOTP
  length={6}
  type="numeric"
  value={otp}
  onChange={setOtp}
  onComplete={verify}
/>
```

3-3 Grouping:
```tsx
<InputOTP length={6} groupGap value={otp} onChange={setOtp} />
```

## Usage guidelines

- `onComplete` fires once when the final segment is filled. Put verification there instead of repeatedly checking `value.length === length` in `onChange`.
- Pair a controlled `value` with `onChange`; without the update, the segments cannot accept input.
- With **react-hook-form**, the value is a single string rather than a native input, so it must go through `Controller` — and `field.onBlur` **must be passed in**. Without it `touchedFields` never updates and a form using `mode: "onBlur"` or `"onTouched"` fails silently: focusing and leaving the field never triggers validation, and errors only appear on submit.
- `onBlur` has whole-group semantics: moving focus between segments does not fire it. Per-segment blur has to be handled separately.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
