---
slug: variable-proximity
name: VariableProximity
category: typography
group: text
tags: [animated]
exports: [VariableProximity]
status: enriched
---

# VariableProximity

> Proximity-driven variable type · per-glyph `font-variation-settings` interpolation + linear, exponential, or Gaussian falloff + reduced-motion baseline + complete screen-reader copy · typography/text · #animated

## When to use

Use VariableProximity when each glyph should interpolate variable-font axes such as `wght` or `opsz` from pointer distance, with a selectable container coordinate system and falloff curve. Use [TextPressure](../text-pressure/text-pressure.md) for a lighter effect that falls back to system-font `scaleX`, or [Shuffle](../shuffle/shuffle.md) for scrambled text.

## Import
```ts
import { VariableProximity } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| label* | `string` | - | Render text (split word by word, spaces retained as unbreakable word gaps); sr-only copy read in full |
| fromFontVariationSettings* | `string` | - | Variable axis settings when the mouse is far away, such as `"'wght' 400, 'opsz' 9"` (variable fonts are required for visual changes) |
| toFontVariationSettings* | `string` | - | The target axis setting when the mouse is close to it, interpolating towards this axis by axis; the default axis falls back to the from value |
| containerRef | `RefObject<HTMLElement \| null>` | - | Reference container for calculating mouse relative coordinates; default falls back to viewport coordinates |
| radius | `number` | `50` | Influence radius (px); if exceeded, the from setting will be restored |
| falloff | `"linear" \| "exponential" \| "gaussian"` | `"linear"` | Decay curve; exponential is steeper, gaussian center is more concentrated and soft |
| className | `string` | - | Extra class name merged into root span |
| style | `CSSProperties` | - | Inline styles merged into the root span |

> Note: The default demonstration controls of showcase controls are `radius={90}`, but the default value of the interface is `50`.

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `React.MouseEventHandler<HTMLSpanElement>` | Callback when root span is clicked |

## Example
```tsx
function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <VariableProximity
        label="Move your pointer here"
        fromFontVariationSettings="'wght' 400, 'opsz' 9"
        toFontVariationSettings="'wght' 900, 'opsz' 40"
        containerRef={ref}
        radius={90}
        falloff="linear"
        className="text-3xl font-medium"
      />
    </div>
  );
}
```

## Usage guidelines

- Visual changes require a real variable font whose axes match `from` and `to`, such as `wght` or `opsz`. Unsupported axes do not change; this is a font capability boundary.
- `containerRef` defines the distance coordinate system. Without it, viewport coordinates are used and an embedded effect may feel offset; normally point it to the wrapping box.
- `toFontVariationSettings` interpolates only axes also present in `from`; additional target axes are ignored.
- Reduced-motion mode freezes the baseline `from` settings and disables pointer interpolation.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
