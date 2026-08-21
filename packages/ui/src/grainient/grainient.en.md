---
slug: grainient
name: Grainient
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Grainient]
status: enriched
---

# Grainient

> Grain gradient · Three-color warped WebGL gradient with noise-driven rotation, film grain, contrast, and color controls · OGL with a static reduced-motion fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for a calm, flowing three-color gradient with a pronounced film-grain texture behind a hero, sign-in page, empty state, or card. Use [GradientBlinds](../gradient-blinds/gradient-blinds.md) for slats and a spotlight, [Ferrofluid](../ferrofluid/ferrofluid.md) for liquid-metal ridges, or [DotPattern](../dot-pattern/dot-pattern.md) for static geometry. Grainient stays subdued enough to support large areas of foreground text.

## Import
```ts
import { Grainient } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| timeSpeed | `number` | `0.25` | Animation-speed multiplier; 0 produces a static gradient |
| colorBalance | `number` | `0` | Three-color bias; negative values favor `color3` and positive values favor `color1` |
| warpStrength | `number` | `1` | Inverse warp control: higher values restrain distortion; 0.3-3 is recommended |
| warpFrequency | `number` | `5` | Frequency of the sinusoidal domain warp, controlling wrinkle density |
| warpSpeed | `number` | `2` | Domain distortion drift speed over time |
| warpAmplitude | `number` | `50` | Base domain-warp amplitude, combined with `warpStrength` |
| blendAngle | `number` | `0` | Axis angle for the three-color blend, in degrees |
| blendSoftness | `number` | `0.05` | Softness of color-band transitions |
| rotationAmount | `number` | `500` | Maximum noise-driven rotation in degrees |
| noiseScale | `number` | `2` | Rotation-noise scale; higher values create finer variation |
| grainAmount | `number` | `0.1` | Film-grain intensity; 0 produces a clean gradient |
| grainScale | `number` | `2` | Grain sampling scale, controlling density |
| grainAnimated | `boolean` | `false` | Animate the grain over time; static grain costs less to render |
| contrast | `number` | `1.5` | Contrast applied around middle gray |
| gamma | `number` | `1` | Gamma correction, <1 to brighten, >1 to darken |
| saturation | `number` | `1` | Saturation, 0=grayscale, >1 to enhance |
| centerX | `number` | `0` | Horizontal viewport-center offset used for framing |
| centerY | `number` | `0` | Vertical viewport-center offset used for framing |
| zoom | `number` | `0.9` | View zoom; lower values reveal more of the color field |
| color1 | `string` | `--color-chart-1` | Gradient first color (bright end), any CSS color |
| color2 | `string` | `--color-chart-2` | Gradient second color (main color/middle section) |
| color3 | `string` | `--color-chart-4` | Gradient third color (dark end) |
| className | `string` | - | Root container, includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static gradient content for SSR, reduced motion, or unavailable WebGL |

## Examples
```tsx
// Default warped three-color gradient using chart tokens
<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Grainient />
  <div className="relative z-10 flex h-full items-center justify-center text-white/85">
    Hulian component library
  </div>
</div>
```
```tsx
// Warm three-color palette with a closer crop
<Grainient color1="oklch(0.82 0.16 70)" color2="oklch(0.62 0.2 30)" color3="oklch(0.32 0.06 300)" zoom={1.3} />
```

## Usage Guidelines

- OGL/WebGL renders on the client. SSR and unavailable WebGL show the static gradient fallback.
- The root uses `absolute inset-0 z-0`; place it in a `relative` container and keep foreground content above it with `relative z-10`.
- Enabling `grainAnimated` recalculates grain every frame. Keep the default static grain for persistent, full-area backgrounds when possible.
- `warpStrength` is inverse: increasing it restrains the distortion instead of amplifying it.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
