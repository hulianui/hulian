---
slug: rating
name: Rating
category: forms
group: advanced
tags: []
exports: [Rating]
status: enriched
---

# Rating

> Dependency-free rating control · radio semantics + custom icons + hover preview + token-based color · forms/advanced

## When to use

Use Rating to collect a star score or satisfaction level, or to show an existing score visually. Icons can be replaced with hearts, flames, or other symbols, while `color-mix` derives hover colors from the configured token. For a read-only view that only needs the numeric value, render text instead.

## Import
```ts
import { Rating } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `number` | — | Controlled current score. |
| defaultValue | `number` | — | Initial score when uncontrolled. |
| max | `number` | — | Maximum number of rating icons. |
| readOnly | `boolean` | `false` | Shows a noninteractive rating. |
| disabled | `boolean` | — | Disables interaction. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Icon size. |
| color | `string` | `var(--color-primary)` | Icon color as any CSS color or token variable; hover color is derived automatically. |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: number \| null) => void` | Called when the user selects a rating. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Custom icon, such as `<Heart />` (default solid five-pointed star) |
| emptyIcon | `ReactNode` | Customize the empty status icon, reuse the icon by default (same shape and empty color) |

## Example
```tsx
const [v, setV] = useState<number | null>(3);
<Rating value={v ?? 0} onValueChange={setV} />
```

Read-only and custom icon/color:
```tsx
<Rating value={4} readOnly />
<Rating defaultValue={3} color="var(--color-danger)" icon={<Heart size="1em" fill="currentColor" />} />
```

## Usage guidelines

- The callback is `onValueChange`, not the native `onChange`.
- In `readOnly` mode, no radio inputs are rendered; only a static graphic with `aria-label` remains. Interactive mode uses real radio controls that can be selected by value.
- Token colors must use the `--color-` prefix, for example `var(--color-primary)`. Bare `var(--primary)` is not resolved; see [[hulian-token-color-var-needs-color-prefix]].
- A custom `icon` needs `fill="currentColor"` to render as a solid shape, as shown above; otherwise only its stroke is colored.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Upload](../upload/upload.md)
