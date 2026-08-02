---
slug: color-swatch-picker
name: ColorSwatchPicker
category: forms
group: advanced
tags: []
exports: [ColorSwatchPicker]
status: enriched
---

# ColorSwatchPicker

> Preset color selector · Base UI RadioGroup swatches with arrow-key navigation, selection ring, and blend-mode checkmark · forms/advanced

## When to use

Use ColorSwatchPicker to choose one value from a fixed palette, such as brand or label colors. It presents RadioGroup semantics as color swatches and includes arrow-key navigation. Use [ColorPicker](../colorpicker/colorpicker.md) when the user needs an arbitrary color.

## Import
```ts
import { ColorSwatchPicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors* | `string[]` | — | Default color block list, any CSS color string (hex / rgb / hsl / named color) |
| value | `string` | — | Controlled selection value (must be strictly equal to an item in colors) |
| defaultValue | `string` | — | Uncontrolled initial selection value |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Color block size |
| disabled | `boolean` | `false` | Disable entire group |
| className | `string` | — | Additional class name for the container. |
| aria-label | `string` | Locale default | Accessible name; `enUS` provides “Color swatches”, and an explicit value takes precedence. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(color: string) => void` | Select change callback |

## Examples
```tsx
const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
const [v, setV] = useState("#3b82f6");
<ColorSwatchPicker colors={PALETTE} value={v} onValueChange={setV} />

// Uncontrolled
<ColorSwatchPicker colors={PALETTE} defaultValue="#3b82f6" size="lg" />
```

## Usage guidelines

- A controlled `value` must be **strictly equal** to an entry in `colors` to show as selected. `"#FFF"` differs from `"#ffffff"`, and `"#3b82f6"` differs from `"rgb(59,130,246)"`; normalize casing and format before passing values.
- The component supports single selection only.
- The default group label follows `ConfigProvider locale`; the no-provider fallback remains Chinese.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
