---
slug: color-field
name: ColorField
category: forms
group: advanced
tags: []
exports: [ColorField, normalizeHex, isHexColor]
status: enriched
---

# ColorField

> Color field · Compact swatch and hexadecimal input with native color picker, shorthand expansion (`#abc` → `#aabbcc`), and draft-state editing · forms/advanced

## When to use

Use ColorField for a compact **single-line** color value in a form, such as a theme settings table, design-token editor, or chart-color row where the value is known and adjusted occasionally.

For a full saturation panel with HEX/RGB/HSL switching, use [ColorPicker](../colorpicker/colorpicker.md). For a small fixed palette, use [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md). ColorField is designed to fit beside a label or description without expanding the form row.

## Import
```ts
import { ColorField, normalizeHex, isHexColor } from "@hulianui/ui"
```

## Props

Inherit native `<input>` properties (`size`/`prefix`/`value`/`defaultValue`/`onChange`/`type` have been overridden).

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | — | controlled value. Accept `#rgb` / `#rrggbb` / None `#` writing method, the internal unified standard is lowercase `#rrggbb` |
| defaultValue | `string` | `"#3b82f6"` | uncontrolled initial value |
| showSwatch | `boolean` | `true` | Click on the color block on the left to open the system color picker |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size (same shell variant as Input, color blocks scale accordingly) |
| invalid | `boolean` | `false` | Marked red when used independently; automatically driven by Field.Root invalid in hulian Field |
| disabled | `boolean` | `false` | Disable both text box and color picker |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(hex: string) => void` | Called with a **normalized `#rrggbb` value** after valid input; invalid drafts do not trigger it. |

## Utility functions

| function | sign | illustrate |
|------|------|------|
| normalizeHex | `(input: string) => string \| null` | Normalized to lowercase `#rrggbb`; cannot be parsed and returns `null` (no error thrown, no default color) |
| isHexColor | `(input: string) => boolean` | Whether it can be parsed (3/6 bits, `#` can be omitted) |

Two pure functions are exported separately: "Which writing methods are considered legal colors?" The consumer must also use it (for example, verify before importing a theme configuration), and should not only live inside the component.

## Examples
```tsx
const [hex, setHex] = useState("#38e8ff");
<ColorField value={hex} onValueChange={setHex} className="w-40" aria-label="Primary color" />
```

One row and one color in the configuration table:
```tsx
{THEME_KEYS.map((k) => (
  <div key={k} className="flex items-center gap-3">
    <span className="w-28 text-sm">{k}</span>
    <ColorField value={theme[k]} onValueChange={(hex) => setColor(k, hex)} className="w-36" aria-label={k} />
  </div>
))}
```

## Usage guidelines

- **A short hex value is shorthand, not a different number.** `#abc` expands to `#aabbcc` by repeating each digit, not to `#abc000`. `normalizeHex` follows this rule.
- **Do not bind the normalized controlled value directly to the text input.** Doing so would reject the first partial character, for example changing `#3` back to the previous value before the user can finish. ColorField keeps an internal draft while typing, emits only after parsing succeeds, and normalizes the draft on blur. Preserve this behavior in extensions.
- `onValueChange` **does not fire** for an invalid draft, so consumers receive only usable colors. Listen to native `onInput` if the application must observe incomplete input.
- An unparseable external `value` falls back to the internal value instead of crashing. This is defensive behavior, not a contract; controlled consumers should still provide valid colors.
- The swatch overlays a transparent native `input[type=color]` on a token-colored span because native color-input appearance is not fully styleable. Avoid overriding `appearance`, which can break the control.

## Related
[ColorPicker](../colorpicker/colorpicker.md) · [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md) · [Input](../input/input.md) · [Field](../field/field.md) · [SecretField](../secret-field/secret-field.md)
