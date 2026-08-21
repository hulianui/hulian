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

> Selects colors through saturation and hue controls with HEX, RGB, or HSL output. · forms/advanced

## When to use

Use ColorPicker when users need to choose any color from a saturation panel and switch output among HEX, RGB, and HSL. For a small set of presets, use the lighter [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md).

## Import
```ts
import { ColorPicker, parseColor, rgbToHex, rgbToHsl, formatColor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | - | Controlled color values. Accepts hex / rgb() / hsl() strings, and the internal unified specification is that hex is the single source of truth. |
| defaultValue | `string` | `"#3b82f6"` | uncontrolled initial value |
| format | `"hex" \| "rgb" \| "hsl"` | - | Controlled output/display format, input will enter the format controlled mode |
| defaultFormat | `"hex" \| "rgb" \| "hsl"` | `"hex"` | uncontrolled initial format |
| disabled | `boolean` | `false` | Disabled: Overlay + Shield interaction |
| showInput | `boolean` | `true` | Whether to display text input |
| showFormatSwitcher | `boolean` | `true` | Whether to display the HEX/RGB/HSL format switcher |
| className | `string` | - | Additional class name for the outer shell. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Change callback; the argument is a string in the **currently selected format**, and switching formats also emits. Fires **on every frame** while the saturation panel or hue bar is dragged |
| onValueCommitted | `(value: string) => void` | Commit callback, fired once per finished edit, in the same format as `onValueChange`. Triggers: pointer release on the panel, input blur or Enter, and format switching |
| onFormatChange | `(format: ColorFormat) => void` | Format switching callback |

## Examples
```tsx
// Controlled (note that onValueChange gives the current format string)
const [v, setV] = useState("#3b82f6");
<ColorPicker value={v} onValueChange={setV} />

// Fixed RGB output, hidden switcher
<ColorPicker defaultValue="#3b82f6" defaultFormat="rgb" showFormatSwitcher={false} />

// Live preview from change, undo stack and persistence from committed
<ColorPicker
  defaultValue="#3b82f6"
  onValueChange={setPreview}
  onValueCommitted={(v) => pushUndo(v)}
/>
```

## Usage guidelines

- `onValueChange` returns a string in the active format (hex, rgb, or hsl), and changing the format also emits a value. Do not assume callbacks always return hex. Hex remains the internal source of truth.
- `onValueChange` fires on every frame while the saturation panel or hue bar is dragged, so a single drag produces dozens to hundreds of calls. Attach undo entries, network writes, and reflow-triggering work to `onValueCommitted` instead of debouncing yourself: a debounce cannot know the exact release moment and delays the final value past the moment a popover closes.
- `onValueCommitted` means **one edit finished**, not "the value changed". Clicking the panel once without dragging still emits on release even though the color never moved. Compare against the previously received value if you need deduplication.
- `pointercancel`, meaning the drag was interrupted by the system or another gesture, does **not** emit `onValueCommitted`. Keep the last committed value in that case, and never persist a mid-drag `onValueChange` value as final.
- A controlled `value` may be any supported hex, `rgb()`, or `hsl()` string. The component normalizes it to hex for rendering and converts it back to the selected format when emitting changes.
- A controlled `value` combined with only an `onValueCommitted` listener **freezes** the panel: nothing writes `value` back during the drag, so the picker cannot move. For commit-only usage switch to the uncontrolled `defaultValue`, and remount with `key` when the external value has to be followed.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
