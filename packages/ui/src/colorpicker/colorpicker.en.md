---
slug: colorpicker
name: ColorPicker
category: forms
group: advanced
tags: []
exports: [ColorPicker, parseColor, rgbToHex, rgbToHsl, formatColor]
status: enriched
---

# ColorPicker

> Color picker · react-colorful core with HEX/RGB/HSL output and format switching, plus HulianUI token styling · forms/advanced

## When to use

Use ColorPicker when users need to choose any color from a saturation panel and switch output among HEX, RGB, and HSL. For a small set of presets, use the lighter [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md).

## Import
```ts
import { ColorPicker, parseColor, rgbToHex, rgbToHsl, formatColor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | — | Controlled color values. Accepts hex / rgb() / hsl() strings, and the internal unified specification is that hex is the single source of truth. |
| defaultValue | `string` | `"#3b82f6"` | uncontrolled initial value |
| format | `"hex" \| "rgb" \| "hsl"` | — | Controlled output/display format, input will enter the format controlled mode |
| defaultFormat | `"hex" \| "rgb" \| "hsl"` | `"hex"` | uncontrolled initial format |
| disabled | `boolean` | `false` | Disabled: Overlay + Shield interaction |
| showInput | `boolean` | `true` | Whether to display text input |
| showFormatSwitcher | `boolean` | `true` | Whether to display the HEX/RGB/HSL format switcher |
| className | `string` | — | Additional class name for the outer shell. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Change callback, the parameter is a string of **currently selected format**; switching formats will also trigger |
| onFormatChange | `(format: ColorFormat) => void` | Format switching callback |

## Examples
```tsx
// Controlled (note that onValueChange gives the current format string)
const [v, setV] = useState("#3b82f6");
<ColorPicker value={v} onValueChange={setV} />

// Fixed RGB output, hidden switcher
<ColorPicker defaultValue="#3b82f6" defaultFormat="rgb" showFormatSwitcher={false} />
```

## Usage guidelines

- `onValueChange` returns a string in the active format (hex, rgb, or hsl), and changing the format also emits a value. Do not assume callbacks always return hex. Hex remains the internal source of truth.
- A controlled `value` may be any supported hex, `rgb()`, or `hsl()` string. The component normalizes it to hex for rendering and converts it back to the selected format when emitting changes.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
