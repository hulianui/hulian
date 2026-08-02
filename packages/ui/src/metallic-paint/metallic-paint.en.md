---
slug: metallic-paint
name: MetallicPaint
category: decoration
group: overlay-fx
tags: [animated]
exports: [MetallicPaint]
status: enriched
---

# MetallicPaint

> Liquid-metal paint surface · WebGL decorative background · fBm fluid distortion + RGB dispersion + multi-stop metallic stripe gradient (ogl · tokens · reduced-motion fallback) · decoration/overlay-fx · #animated

## When to Use

Use it for a full-surface liquid-metal background with refractive iridescence and striped gradients, such as a hero, brand page, or card surface. For a regular animated border, use [BorderBeam](../border-beam/border-beam.md) or [ShineBorder](../shine-border/shine-border.md); for discrete merging blobs, use [MetaBalls](../meta-balls/meta-balls.md). MetallicPaint is designed as a background beneath foreground content.

## Import
```ts
import { MetallicPaint } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| lightColor | `string` | `var(--color-chart-1)` | High-gloss metallic color (highlight peak). CSS color or token prefixed with `--color-` |
| darkColor | `string` | `var(--color-foreground)` | Dark metallic color (trough shadow) |
| speed | `number` | `1` | Metal flow velocity factor, 0≈ stationary (still extremely slow drift) |
| scale | `number` | `1` | Texture scale; higher values produce denser detail |
| refraction | `number` | `1` | Refraction intensity; higher values make RGB separation and iridescence more visible |
| liquid | `number` | `0.6` | Liquid disturbance intensity, the larger it is, the more like flowing mercury, 0 = flat mirror surface |
| blur | `number` | `0.6` | The edge of the ribbon is blurred, 0.2–1.5 is recommended; if it is too small, the stripes will be stiff, and if it is too large, the metallic feeling will disappear |
| angle | `number` | `-45` | Overall rotation angle (degrees), changing the incident direction of light |
| className | `string` | — | Passthrough to container (or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static replacement without WebGL (default token metal gradient div) |

## Examples
```tsx
// Default metallic paint with centered copy; the container must be relative and clip overflow.
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.01 255)" }}>
  <MetallicPaint className="opacity-95" />
  <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
    Metallic Paint
  </div>
</div>
```
```tsx
//Strong refractive iridescence
<MetallicPaint refraction={1.8} lightColor="var(--color-chart-2)" className="opacity-95" />
```

## Usage Guidelines

- Token values passed through `lightColor` or `darkColor` must use the `--color-` prefix; the shader cannot parse a bare `var(--primary)`. See [[hulian-token-color-var-needs-color-prefix]].
- WebGL/ogl component, `"use client"` is only client-side rendering; see [[webgl-canvas-loseContext-poisons-strictmode-remount]] for the risk of canvas context reuse under StrictMode dual mounting.
- The parent container needs `overflow-hidden` to cut off the excess metal pattern; remember to give `relative z-10` to the text layer when stacking copy.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
