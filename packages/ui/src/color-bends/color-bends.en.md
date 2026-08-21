---
slug: color-bends
name: ColorBends
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [ColorBends]
status: enriched
---

# ColorBends

> Multicolor flow field · Layered sinusoidal noise and soft-threshold sampling produce interlaced organic ribbons · Pointer parallax, attraction, automatic rotation, theme-aware colors, and a reduced-motion fallback · OGL/WebGL · decoration/backdrop · #animated #webgl

## When to Use

Use it for a backdrop of colorful organic ribbons that bend through one another, such as a creative landing page, AI-product hero, or brand field. Use [Beams](../beams/beams.md) for a single-color light curtain, [Balatro](../balatro/balatro.md) for a painted vortex, or [DotPattern](../dot-pattern/dot-pattern.md) for a regular grid. ColorBends offers the richest color mixing, pointer attraction, and tuning surface of these options.

## Import
```ts
import { ColorBends } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | Five chart tokens | Ribbon colors; accepts any CSS colors, uses at most the first eight, and defaults to theme-aware tokens |
| rotation | `number` | `90` | Static rotation in degrees that sets the overall flow direction |
| autoRotate | `number` | `0` | Automatic rotation speed in degrees per second; 0 disables continuous rotation |
| speed | `number` | `0.2` | Flow speed coefficient; 0 = freeze as static texture |
| scale | `number` | `1` | Flow-field scale; lower values produce denser bands, while higher values stretch them |
| frequency | `number` | `1` | Ripple frequency; higher values create denser sinusoidal variation |
| warpStrength | `number` | `1` | Amount of ribbon deformation applied by the flow field |
| iterations | `number` | `1` | Noise-folding passes from 1 to 5; higher values create more complex structures |
| intensity | `number` | `1.5` | Overall brightness multiplier |
| bandWidth | `number` | `6` | Soft-threshold band parameter; higher values make ribbons narrower and sharper |
| noise | `number` | `0.15` | Grain intensity; 0 produces a clean image |
| parallax | `number` | `0.5` | Pointer-parallax strength used to create depth |
| mouseInfluence | `number` | `1` | Pointer pulling strength; 0=no response to pointer |
| transparent | `boolean` | `true` | Render only the ribbons over a transparent background; false adds a black background |
| className | `string` | - | Class name forwarded to the root, which includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static gradient content used for reduced motion, SSR, or unavailable WebGL |

## Examples
```tsx
// Default multicolor flow field using chart tokens
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ColorBends />
</div>
```
```tsx
// Warm ribbons with automatic rotation
<ColorBends
  colors={["oklch(0.72 0.22 30)", "oklch(0.78 0.18 60)", "oklch(0.68 0.2 350)"]}
  autoRotate={8}
  intensity={2.2}
  bandWidth={8}
  speed={0.15}
/>
```

## Usage Guidelines

- **WebGL client rendering**: the effect depends on OGL and WebGL. SSR renders `fallback`; do not mount realtime logic directly in a server component.
- **Token colors require the `--color-` prefix**: pass entries such as `var(--color-chart-1)`. Bare names such as `var(--chart-1)` do not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Only the first eight `colors` are used; additional entries are ignored.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
