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

> Multicolor flow field · WebGL background component · Sinusoidal folded noise field is superimposed according to soft threshold bandwidth sampling to generate mutually bent organic color strips + pointer parallax/traction/automatic rotation (ogl·theme awareness·reduced-motion degradation) · decoration/backdrop · #animated #webgl

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
| rotation | `number` | `90` | Static reference rotation angle (degrees), determines the overall direction of the flow field |
| autoRotate | `number` | `0` | Automatic rotation angular speed (degrees/second); if not 0, continue to rotate over time |
| speed | `number` | `0.2` | Flow speed coefficient; 0 = freeze as static texture |
| scale | `number` | `1` | Flow-field scale; lower values produce denser bands, while higher values stretch them |
| frequency | `number` | `1` | Ripple frequency; the sinusoidal disturbance is more intensive after the increase |
| warpStrength | `number` | `1` | Warp strength, controls the deformation amplitude of the ribbon being pulled by the wave field |
| iterations | `number` | `1` | Fold iterations from 1 to 5; higher values create more complex structure |
| intensity | `number` | `1.5` | Overall brightness gain, amplified final color |
| bandWidth | `number` | `6` | Soft-threshold band parameter; higher values make ribbons narrower and sharper |
| noise | `number` | `0.15` | Granular noise intensity, breaking the plastic feel; 0=pure |
| parallax | `number` | `0.5` | Pointer parallax effect, creating depth of field |
| mouseInfluence | `number` | `1` | Pointer pulling strength; 0=no response to pointer |
| transparent | `boolean` | `true` | Transparent background (only renders ribbon); when false, fills the black background |
| className | `string` | — | Class name forwarded to the root, which includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / no WebGL content rendered in the bottom layer of the static gradient pocket when downgrading |

## Examples
```tsx
//Default chart token multi-color flow field
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ColorBends />
</div>
```
```tsx
// Custom warm color band + automatic rotation wallpaper level
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
- **The token color must be prefixed with `--color-`**: `colors` The CSS variable must be passed with the full name of `var(--color-chart-1)`, and the bare `var(--chart-1)` will not be parsed. See [[hulian-token-color-var-needs-color-prefix]].
- Only the first eight `colors` are used; additional entries are ignored.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
