---
slug: glass-surface
name: GlassSurface
category: decoration
group: overlay-fx
tags: [animated]
exports: [GlassSurface]
status: enriched
---

# GlassSurface

> Liquid glass refractive surface · SVG feDisplacementMap three-channel dispersion + RGB chromatic aberration edge (zero dependency · token frosted bottom/hair edge/focus ring · RSC client · non-SVG browser fallback backdrop-blur · reduced-motion off transition) · decoration/overlay-fx · #animated

## When to Use

Use it for a fixed-size pill, card, or button surface that visibly refracts the background and separates RGB edges. Use [FluidGlass](../fluid-glass/fluid-glass.md) for a full-screen, pointer-following effect or [Lens](../lens/lens.md) for local magnification. GlassSurface uses an SVG displacement map, so place it over detailed content where refraction is visible.

## Import
```ts
import { GlassSurface } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| width | `number \| string` | `200` | Width, number is treated as px, string is passed through as it is |
| height | `number \| string` | `80` | Height, number is treated as px, string is passed through as it is |
| borderRadius | `number` | `20` | Fillet radius px, acting on the inner rectangle of the container and displacement map at the same time |
| borderWidth | `number` | `0.07` | Edge highlight band width coefficient 0~1 (relatively short side), the larger the wider the refraction |
| brightness | `number` | `50` | Displacement map internal rectangular brightness (HSL's L, 0~100), control glass thickness texture |
| opacity | `number` | `0.93` | Displacement map internal rectangle opacity 0~1 |
| blur | `number` | `11` | Displacement map internal rectangular Gaussian blur radius px, softening the refraction boundary |
| displace | `number` | `0` | Refraction result quadratic Gaussian blur, eliminate pixel aliasing |
| backgroundOpacity | `number` | `0` | Frosted background opacity, 0=fully transparent |
| saturation | `number` | `1` | backdrop-filter saturation magnification |
| distortionScale | `number` | `-180` | Refraction displacement; negative values indent, positive values bulge, and channel offsets add chromatic separation |
| redOffset | `number` | `0` | The extra displacement (color difference) of the red channel relative to distortionScale |
| greenOffset | `number` | `10` | Green channel additional displacement (color difference) |
| blueOffset | `number` | `20` | Blue channel additional displacement (color difference) |
| xChannel | `GlassChannel` | `"R"` | X-direction offset access channel (`"R"\|"G"\|"B"\|"A"`) |
| yChannel | `GlassChannel` | `"G"` | Y-direction offset access channel |
| mixBlendMode | `CSSProperties["mixBlendMode"]` | `"difference"` | Red/blue gradient overlay blending mode in the displacement map (determines the refraction texture shape) |
| className | `string` | — | Root container className |
| style | `CSSProperties` | — | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Glass surface content (centered above the refractive layer) |

## Examples

```tsx
//Default liquid glass pill (the outer layer needs to have a rich background to see the refraction)
<GlassSurface width={220} height={90} borderRadius={24}>
  <span className="text-sm font-semibold text-foreground">Glass Surface</span>
</GlassSurface>

// Strong dispersion thick glass
<GlassSurface
  width={240}
  height={100}
  borderRadius={28}
  distortionScale={-220}
  greenOffset={25}
  blueOffset={45}
>
<span className="text-sm font-semibold text-foreground">HuLian</span>
</GlassSurface>
```

## Usage Guidelines

- Refraction relies on SVG feDisplacementMap to shift background pixels. The effect is almost invisible on a solid color/blank background. It must be placed on a background with gradients/textures/images.
- Browsers that do not support SVG filters will fall back to backdrop-blur (no dispersion); this is a built-in downgrade of the component, not a bug.
- Client-side components (relying on runtime SVG filters and pointers), only static shells are available under SSR, and interactive states must be verified in the browser.
- Turn off transition animation in reduced-motion (refraction itself is still there).

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
