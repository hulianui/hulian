---
slug: secret-field
name: SecretField
category: forms
group: advanced
tags: []
exports: [SecretField, maskSecret]
status: enriched
---

# SecretField

> Masks sensitive values while supporting reveal and copy actions. · forms/advanced

## When to use

Use SecretField to display an existing API key, token, or secret with masking, reveal, copy, and optional reset or revoke actions. It is for viewing and copying stored secrets, not entering them. Use [Input](../input/input.md) with `type="password"` for password entry.

For searchable option selection rather than secret display, use [Combobox](../combobox/combobox.md).

## Import
```ts
import { SecretField, maskSecret } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value * | `string` | - | Original unmasked secret. |
| revealed | `boolean` | - | Controlled reveal state; omit for internal state. |
| maskStrategy | `"full"\|"prefix-suffix"` | `"prefix-suffix"` | `full` masks everything; `prefix-suffix` retains the beginning and end. |
| copyable | `boolean` | `true` | Whether to display the copy button |
| readOnly | `boolean` | `false` | Read-only appearance (remove interactive strokes) |
| size | `"sm"\|"md"` | `"md"` | - |
| className | `string` | - | - |

## Events

| Event | Type | Description |
|------|------|------|
| onRevealedChange | `(revealed: boolean) => void` | Called when reveal state changes; use for controlled state. |
| onCopy | `(value: string) => void` | Called with the original value after copying. |

## Slots

| Slot | Type | Description |
|------|------|------|
| actions | `ReactNode` | Tail action slot (reset/revocation, etc.) |

The exported `maskSecret(value, strategy)` helper generates a masked string without rendering the component.

## Example
```tsx
<SecretField value={apiKey} maskStrategy="prefix-suffix" />
```

Full masking, no copy action, and controlled reveal:
```tsx
const [revealed, setRevealed] = useState(false);
<SecretField
  value={apiKey}
  maskStrategy="full"
  copyable={false}
  revealed={revealed}
  onRevealedChange={setRevealed}
/>
```

## Usage guidelines

- `value` must be the original plaintext secret. Masking is only a presentation layer, and the original remains available for copying; never pass an already-masked string.
- Omit `revealed` for internal state. For externally coordinated reveal behavior, pass both `revealed` and `onRevealedChange`.
- `copyable` defaults to true. Set `copyable={false}` when policy forbids clipboard access.

## Related

Show, hide, copy, and copied labels follow `ConfigProvider`.
[Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
