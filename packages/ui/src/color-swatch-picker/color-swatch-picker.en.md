---
slug: color-swatch-picker
name: ColorSwatchPicker
category: forms
group: advanced
tags: []
exports: [ColorSwatchPicker, normalizeSwatches]
status: enriched
---

# ColorSwatchPicker

> Preset color selector · Base UI RadioGroup swatches with arrow-key navigation, selection ring, and blend-mode checkmark · forms/advanced

## When to use

Use ColorSwatchPicker to choose one value from a fixed palette, such as brand or label colors. It presents RadioGroup semantics as color swatches and includes arrow-key navigation. Use [ColorPicker](../colorpicker/colorpicker.md) when the user needs an arbitrary color.

## Import
```ts
import { ColorSwatchPicker, normalizeSwatches } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors* | `(string \| { color: string; label?: string })[]` | — | Preset swatch list. A string is any CSS color (hex / rgb / hsl / named color / `var(--color-x)`); an object may add a `label` used as the accessible name and hover hint. Both forms can be mixed |
| value | `string` | — | Controlled selection value (must be strictly equal to a swatch `color`) |
| defaultValue | `string` | — | Uncontrolled initial selection value |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Color block size |
| disabled | `boolean` | `false` | Disable entire group |
| className | `string` | — | Additional class name for the container. |
| aria-label | `string` | Locale default | Accessible name; `enUS` provides “Color swatches”, and an explicit value takes precedence. |

`ColorSwatchItem` (the object form of `colors`)

| Name | Type | Default | Description |
|------|------|------|------|
| color * | `string` | — | Any CSS color string. It is also the selection value compared strictly against `value`. |
| label | `string` | Falls back to `color` itself | Accessible name and hover hint. Always provide it for token colors such as `var(--color-primary)`, otherwise a screen reader announces the variable name. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(color: string) => void` | Select change callback; the argument is always the swatch `color`, never the `label` |

## Utilities

| Name | Signature | Description |
|------|------|------|
| normalizeSwatches | `(colors: (string \| ColorSwatchItem)[]) => { color: string; label: string }[]` | Normalizes the mixed array into labelled swatches; string entries and missing or blank labels fall back to the color value itself |

## Examples
```tsx
const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
const [v, setV] = useState("#3b82f6");
<ColorSwatchPicker colors={PALETTE} value={v} onValueChange={setV} />

// Uncontrolled
<ColorSwatchPicker colors={PALETTE} defaultValue="#3b82f6" size="lg" />

// Theme token palette: pass a label so screen readers do not announce "var(--color-primary)"
<ColorSwatchPicker
  colors={[
    { color: "var(--color-primary)", label: "Primary" },
    { color: "var(--color-danger)", label: "Danger" },
    "#3b82f6",
  ]}
  defaultValue="var(--color-primary)"
/>
```

## Usage guidelines

- **Token colors need a `label`.** A bare string in `colors` becomes the swatch `aria-label` verbatim, so `var(--color-primary)` is announced as the variable name and means nothing to a screen reader user; `#3b82f6` and `oklch(...)` are read as character strings for the same reason. Only named colors such as `red` or `tomato` survive without a label.
- Identity for `value` and `onValueChange` is always the `color` string, never the `label`. Do not pass a label back as the selected value.
- A controlled `value` must be **strictly equal** to a swatch `color` to show as selected. `"#FFF"` differs from `"#ffffff"`, and `"#3b82f6"` differs from `"rgb(59,130,246)"`; normalize casing and format before passing values.
- The component supports single selection only.
- The default group label follows `ConfigProvider locale`; the no-provider fallback remains Chinese.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
