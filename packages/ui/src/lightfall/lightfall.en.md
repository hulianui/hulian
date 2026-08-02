---
slug: lightfall
name: Lightfall
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Lightfall]
status: enriched
---

# Lightfall

> Falling light field · A raymarched tunnel cycles beam colors by depth and combines configurable streaks, trails, twinkle, central glow, and pointer attraction · Theme-token OGL/WebGL with a static fallback · decoration/backdrop · #animated #webgl

## When to Use

Use Lightfall behind a dark hero or immersive dashboard when several colored streaks should fall through a tunnel-like depth field. Tune streak count and trails sparingly so foreground copy remains legible. Choose [LightRays](../light-rays/light-rays.md) for rays emitted from one origin, [LightPillar](../light-pillar/light-pillar.md) for one continuous column, or [DotPattern](../dot-pattern/dot-pattern.md) for a static texture.

## Import
```ts
import { Lightfall } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]` | Beam palette sampled cyclically by depth; accepts CSS colors and uses at most the first eight entries |
| backgroundColor | `string` | `var(--color-primary)` | Color of the soft glow at the tunnel center |
| speed | `number` | `0.5` | Falling-speed multiplier; 0 freezes the time-driven falling and twinkle state while still rendering the field |
| streakCount | `number` | `2` | Simultaneous streak count, rounded and clamped from 1 to 16 |
| streakWidth | `number` | `1` | Horizontal width multiplier for each streak |
| streakLength | `number` | `1` | Trail-length multiplier for each streak |
| glow | `number` | `1` | Overall beam-glow multiplier |
| density | `number` | `0.6` | Angular spacing of beam rings; higher values pack them more densely |
| twinkle | `number` | `1` | Brightness variation; 0 keeps streaks steady and 1 enables full pulsing |
| zoom | `number` | `3` | View-distance scale controlling the tunnel's apparent depth |
| backgroundGlow | `number` | `0.5` | Strength of the central background glow; 0 removes it |
| opacity | `number` | `1` | Overall shader opacity |
| mouseInteraction | `boolean` | `true` | Enable pointer-local brightening and attraction when pointer input reaches the canvas |
| mouseStrength | `number` | `0.5` | Strength of the pointer highlight and attraction |
| mouseRadius | `number` | `1` | Radius of pointer influence in shader space |
| className | `string` | — | Class name forwarded to the `absolute inset-0 z-0` live or fallback root |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Decorative content rendered inside the static gradient cover when reduced motion is enabled; the fallback root is `aria-hidden` |

## Examples
```tsx
// Full-size field inside a relative, fixed-height, clipped parent
<div className="relative h-64 overflow-hidden rounded-xl">
  <Lightfall />
  <div className="relative z-10 flex h-full items-center justify-center">
    Lightfall
  </div>
</div>
```
```tsx
// Slow field with longer trails and no pointer response
<Lightfall speed={0.25} streakCount={3} streakLength={1.8} mouseInteraction={false} />
```

## Usage Guidelines

- Lightfall is an `absolute inset-0 z-0` decorative layer. Give its parent `position: relative`, explicit dimensions, and clipping; keep foreground content at `relative z-10` or above.
- During SSR, the live root has no canvas. After hydration, a canvas is appended before OGL import and scene setup; if either step fails, that uninitialized or blank canvas remains and Lightfall does not switch to the reduced-motion fallback. Reduced motion instead renders the static gradient plus decorative `fallback` content.
- The live root defaults to `pointer-events-none`. Add `pointer-events-auto` through `className` if `mouseInteraction` should receive pointer movement, and keep covering foreground layers from intercepting those events.
- An opaque parent or unexpected stacking context can cover the full-size canvas. If rendering succeeds but the effect is invisible, inspect those layers; see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- CSS variables in `colors` and `backgroundColor` require full names such as `var(--color-chart-1)`. See [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
