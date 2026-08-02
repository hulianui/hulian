---
slug: electric-border
name: ElectricBorder
category: decoration
group: overlay-fx
tags: [animated]
exports: [ElectricBorder]
status: enriched
---

# ElectricBorder

> Electrified border · Electrified beating border decoration · SVG turbulent displacement stroke + multi-layer blur halo simulated discharge glow (zero dependency·token·reduced-motion) · decoration/overlay-fx · #animated

## When to Use

Wrap a piece of content (button, card, CTA) with an electric arc stroke that continuously discharges and beats to create a technological/cyber atmosphere. If you want a static soft light stroke, use [ShineBorder](../shine-border/shine-border.md); if you want a single-point surround streamer, use [BorderBeam](../border-beam/border-beam.md); this component is a powerful dynamic effect of "the entire edge is shaking and discharging", which is the most eye-catching but also the heaviest.

## Import
```ts
import { ElectricBorder } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | Current stroke color, light and dark theme. Any CSS color string can be used; the CSS variable feeding SVG stroke must be prefixed with `--color-` before parsing |
| speed | `number` | `1` | Current jitter speed multiplier, the larger the value, the faster the jitter (speed=1 ≈ 2s for one round `<animate>`) |
| chaos | `number` | `1` | The degree of disorder (turbulence displacement intensity), the larger the stroke, the more violent it will be torn, mapping the scale of `feDisplacementMap` |
| thickness | `number` | `2` | The thickness of the soft edge of the frame (px) |
| borderRadius | `number` | `16` | Corner radius (px), applied to both container and current stroke |
| className | `string` | — | Root container additional className |
| style | `CSSProperties` | — | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content wrapped by current frame |

## Examples
```tsx
<ElectricBorder borderRadius={16}>
  <div className="px-8 py-6 text-sm font-medium text-white/85">
    Electric Border
  </div>
</ElectricBorder>
```

Warm round button (high customization):
```tsx
<ElectricBorder color="var(--color-chart-3)" borderRadius={999} thickness={2}>
  <button type="button" className="px-6 py-3 text-sm font-semibold text-white">
Try it now
  </button>
</ElectricBorder>
```

## Usage Guidelines

- When customizing `color`, be sure to bring the `--color-` prefix (such as `var(--color-chart-3)`). Feeding bare `var(--primary)` to SVG stroke does not resolve, and the stroke will become black or disappear. See [[hulian-token-color-var-needs-color-prefix]].
- The stroked arc requires a dark background to be visible, and the glow is almost invisible on a light background.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
