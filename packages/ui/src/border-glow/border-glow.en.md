---
slug: border-glow
name: BorderGlow
category: decoration
group: overlay-fx
tags: [animated]
exports: [BorderGlow]
status: enriched
---

# BorderGlow

> Luminous border card · Pointer-sensitive luminous border card · Light up the colorful grid border along the light cone + outer neon halo (gradient with edge proximity) + optional mounting automatic scanning (zero dependency·token·reduced-motion) · decoration/overlay-fx · #animated

## When to Use

Use it for a content card whose colored edge and outer neon halo follow the nearby pointer. It can also play one automatic sweep after mounting. Use [BorderBeam](../border-beam/border-beam.md) or [ShineBorder](../shine-border/shine-border.md) to decorate an existing element, and [GlareHover](../glare-hover/glare-hover.md) for a hover reflection. BorderGlow owns the whole card and its pointer-tracking cone.

## Import
```ts
import { BorderGlow } from "@hulianui/ui"
```

## Props

Extends `<div>` attributes, with the native `color` attribute omitted.

| Name | Type | Default | Description |
|------|------|------|------|
| className | `string` | - | Transparent root container className (merged into `.border-glow`) |
| edgeSensitivity | `number` | `30` | Edge sensitivity 0-100, the smaller it is, the earlier the outer halo is triggered |
| glowColor | `string` | `var(--color-chart-1)` | Outer halo color (box-shadow), token must be prefixed with `--color-` |
| backgroundColor | `string` | `oklch(0.16 0.02 280)` | Card background; the glow relies on dark contrast and is weaker on light surfaces |
| borderRadius | `number` | `28` | corner radius px |
| glowRadius | `number` | `40` | The outer halo overflows the inner margin px, the larger it is, the farther it spreads |
| glowIntensity | `number` | `1` | Glow intensity magnification 0-2 |
| coneSpread | `number` | `25` | Light cone angle width 0-50, the larger the width, the wider the highlight arc |
| animated | `boolean` | `false` | Automatically play a circle of sweeping light when mounted; skip under reduced-motion |
| colors | `string[]` | chart-1/3/4 | Color grid border selection, circularly mapped to 7 radial anchor points |
| fillOpacity | `number` | `0.5` | Edge color fill layer transparency 0-1 |
| style | `CSSProperties` | - | Inline styles forwarded to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Card content, layered on top of all glowing layers |

## Examples

```tsx
//Default: Move the card in and light the border along the pointer
<BorderGlow>
  <div className="w-64 p-7">
<p className="text-base font-semibold"> Hulian component library </p>
<p className="mt-1.5 text-sm text-white/55"> Move the pointer to the card, and the border will light up along the light cone. </p>
  </div>
</BorderGlow>

// Mount automatic scanning + custom blue tone lighting
<BorderGlow
  animated
  glowColor="var(--color-chart-2)"
  colors={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-5)"]}
  glowRadius={56}
>
  {children}
</BorderGlow>
```

## Usage Guidelines

- The luminous border relies on dark background contrast, and the effect is significantly weaker when placed on a light background; use `backgroundColor` to maintain a dark background.
- `glowColor`/`colors` feed token must be prefixed with `--color-` (Tailwind v4 real name), and bare `var(--primary)` does not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Both pointer tracking and `animated` sweeping are affected by reduced-motion: users prefer to automatically skip sweeping when reducing the animation (the DOM remains unchanged).

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
