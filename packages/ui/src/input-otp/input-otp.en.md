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

| Name | Type | Default | Description |
|------|------|------|------|
| length | `number` | `6` | number of segments |
| value | `string` | — | controlled value |
| defaultValue | `string` | — | uncontrolled initial value |
| type | `"numeric" \| "text"` | `"numeric"` | Numbers only (default) or any characters |
| disabled | `boolean` | — | Disable |
| invalid | `boolean` | `false` | Verification failed status |
| groupGap | `boolean` | — | Insert a horizontal line separator in the middle (3-3 group visual, such as XXX–XXX) |
| className | `string` | — | Container class name |
| aria-label | `string` | — | Accessibility label |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(value: string) => void` | value change callback |
| onComplete | `(value: string) => void` | Callback when full |

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

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
