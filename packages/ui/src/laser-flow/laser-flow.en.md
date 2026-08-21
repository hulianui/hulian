---
slug: laser-flow
name: LaserFlow
category: decoration
group: overlay-fx
tags: [animated]
exports: [LaserFlow]
status: enriched
---

# LaserFlow

> Volumetric laser · A top-down beam combines polar light geometry, FBM fog, flowing edge highlights, pulsing intensity, and pointer-driven tilt · Theme-aware OGL/WebGL implementation with no Three.js dependency and a static fallback · decoration/overlay-fx · #animated

## When to Use

Use LaserFlow as a full-screen or section backdrop when one vertical beam should cut through fog and carry subtle flowing highlights. It is a high-cost atmospheric effect, so reserve it for a focal surface rather than repeating it in lists. Choose [BorderBeam](../border-beam/border-beam.md) for an element outline or [GhostCursor](../ghost-cursor/ghost-cursor.md) for smoke that follows the pointer.

## Import
```ts
import { LaserFlow } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-chart-1)` | Main beam color; accepts any CSS color and defaults to a theme-aware chart token |
| horizontalBeamOffset | `number` | `0.0` | Horizontal beam offset as a fraction of viewport width; positive moves right and negative moves left |
| verticalBeamOffset | `number` | `0.0` | Vertical beam offset as a fraction of viewport height |
| flowSpeed | `number` | `0.35` | Speed multiplier for light pulses traveling through the beam |
| verticalSizing | `number` | `2.0` | Multiplier for the beam's vertical reach |
| horizontalSizing | `number` | `0.5` | Multiplier for the horizontal flare length |
| fogIntensity | `number` | `0.45` | Volumetric-fog strength; 0 removes the fog contribution |
| fogScale | `number` | `0.3` | Fog-noise scale; higher values split the fog into finer structures |
| fogFallSpeed | `number` | `0.6` | Downward drift speed of the fog field |
| wispDensity | `number` | `1` | Density of the subtle flowing highlights along the beam, from 0 to 2 |
| wispSpeed | `number` | `15` | Travel speed of those flowing highlights |
| wispIntensity | `number` | `5` | Brightness of the flowing highlights |
| flowStrength | `number` | `0.25` | Contrast of the traveling light pulse, from 0 to 1 |
| decay | `number` | `1.1` | Width of the beam's attenuation phase |
| falloffStart | `number` | `1.2` | Position at which beam luminance begins to fall off |
| mouseTiltStrength | `number` | `0.01` | Amount of fog tilt driven by pointer input that reaches the canvas; 0 disables the response |
| className | `string` | - | Class name forwarded to the live or fallback root |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Decorative content rendered over the static theme-token beam when reduced motion is enabled; the fallback root is `aria-hidden` |

## Examples
```tsx
<div
  className="relative h-72 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.13 0.02 285)" }}
>
  <LaserFlow />
  <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/80">
    LaserFlow
  </div>
</div>
```

Warm beam with denser fog:
```tsx
<LaserFlow color="oklch(0.72 0.2 35)" fogIntensity={0.6} fogScale={0.35} />
```

## Usage Guidelines

- LaserFlow is an `absolute inset-0 z-0` decorative layer. Use a `relative overflow-hidden` parent with an explicit height and place foreground content at `relative z-10` or above.
- Its WebGL lifecycle creates a fresh canvas for each mount, avoiding context reuse after cleanup during React StrictMode remounts. See [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- During SSR, the live root has no canvas. After hydration, a canvas is appended before OGL import and scene setup; if either step fails, that uninitialized or blank canvas remains and LaserFlow does not switch to the reduced-motion fallback. Reduced motion instead renders the theme-token gradient plus decorative `fallback` content.
- The live and fallback roots are `aria-hidden`, so provide all essential content outside LaserFlow.
- The live root defaults to `pointer-events-none`. Add `pointer-events-auto` through `className` if pointer tilt is required, and make sure foreground layers do not take those pointer hits.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
