---
slug: balatro
name: Balatro
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Balatro]
status: enriched
---

# Balatro

> Swirling paint · WebGL backdrop with a pixelated vortex, layered sinusoidal color mixing, and optional pointer interaction and rotation · OGL, three theme colors, and a reduced-motion conic fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for a full-bleed backdrop with dense painted color and a swirling flow, such as a sign-in page, hero, or card background. Use [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md) for regular geometry, and [Spotlight](../spotlight/spotlight.md) for a lightweight single-color glow. Balatro is a GPU-heavy focal effect, not a small decorative accent.

## Import
```ts
import { Balatro } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| spinRotation | `number` | `-2.0` | Static vortex rotation when `isRotate=false`; the sign selects its direction |
| spinSpeed | `number` | `7.0` | Internal paint-flow speed; higher values produce more vigorous motion |
| offset | `[number, number]` | `[0, 0]` | The offset of the vortex center relative to the midpoint of the screen [x, y] |
| color1 | `string` | `--color-chart-1` | Main color (vortex bright band), CSS color string, the default theme color light and dark adaptive |
| color2 | `string` | `--color-chart-2` | Secondary color (middle of vortex), CSS color string |
| color3 | `string` | `--color-chart-5` | Background color (swirl shadow/gap), CSS color string |
| contrast | `number` | `3.5` | Contrast, the larger the contrast, the sharper the three-color boundary |
| lighting | `number` | `0.4` | Highlight intensity, the larger the vortex peak, the brighter it will be; 0 = no additional highlights |
| spinAmount | `number` | `0.25` | The attenuation of rotation with radius, the larger the spiral tail, the more obvious it is |
| pixelFilter | `number` | `745` | Pixelation factor; higher values produce smaller, finer pixels, while lower values create a coarser retro mosaic |
| spinEase | `number` | `1.0` | Rotation easing coefficient, fine-tuning the overall scaling rotation amount and speed |
| isRotate | `boolean` | `false` | Continuously rotate over time; when enabled, `spinRotation` influences rotation speed |
| mouseInteraction | `boolean` | `true` | Enable pointer interaction; disabling it makes the effect pointer-transparent |
| className | `string` | — | Additional class name for the root container or fallback div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default conic whirlpool bottom) |

## Examples
```tsx
// Full backdrop inside a relative container; the component includes absolute inset-0 z-0.
<div className="relative h-64 overflow-hidden rounded-xl">
  <Balatro />
  <div className="relative z-10 flex h-full items-center justify-center text-white">
    Balatro
  </div>
</div>
```
```tsx
// Custom warm orange vortex + continuous rotation
<Balatro
  color1="oklch(0.72 0.2 40)"
  color2="oklch(0.6 0.18 25)"
  color3="oklch(0.18 0.04 30)"
  isRotate
  spinSpeed={5}
  lighting={0.6}
/>
```

## Usage Guidelines

- **WebGL client rendering**: the component depends on OGL and WebGL and must mount on the client. SSR renders the conic-gradient `fallback`; do not import the realtime implementation directly at the top of a Next.js server-component tree.
- **Token color must be prefixed with `--color-`**: When customizing color1/2/3, the full name must be written when passing CSS variables (such as `var(--color-chart-1)`), bare `var(--chart-1)` will not be parsed → the vortex will turn black. See [[hulian-token-color-var-needs-color-prefix]].
- The parent container must be `relative` + `overflow-hidden`, otherwise `absolute inset-0` cannot be spread or overflows.
- Continuous rotation and high `lighting` values increase GPU cost. Avoid stacking multiple instances in long lists, especially on lower-end devices.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
