---
slug: orb
name: Orb
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Orb]
status: enriched
---

# Orb

> Interactive luminous orb · WebGL/ogl energy sphere + hover brightening/rotation + hue control + reduced-motion radial-gradient fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it as a luminous focal element in a hero, card, or empty state when hover should affect brightness, distortion, and rotation. The canvas fills its container, so the container determines the orb's size and should usually be square. For a full-surface liquid-metal background, use [LiquidChrome](../liquid-chrome/liquid-chrome.md); for a static dot or grid pattern, use [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md).

## Import
```ts
import { Orb } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| hue | `number` | `0` | Hue rotation in degrees. 0 keeps the original blue-violet palette; positive values rotate the YIQ hue clockwise |
| hoverIntensity | `number` | `0.2` | Hover distortion strength (0-1), the larger the value, the more obvious the deformation will be |
| rotateOnHover | `boolean` | `true` | Whether to automatically rotate the light ball when hovering |
| forceHoverState | `boolean` | `false` | Force to stay active on hover (for demonstration/screenshot scenes) |
| className | `string` | - | ClassName passed through to canvas (normal) or fallback div (fallback) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static fallback content without WebGL (centered on a radial gradient ball) |

## Examples

```tsx
// Orb is the focus element and needs to be placed into a square container that determines its size
<div className="relative overflow-hidden rounded-2xl" style={{ width: 280, height: 280 }}>
  <Orb />
</div>
```

```tsx
//Change hue + force hover state (suitable for screenshots)
<div className="relative" style={{ width: 280, height: 280 }}>
  <Orb hue={120} forceHoverState hoverIntensity={0.4} />
</div>
```

## Usage Guidelines

- WebGL components must be rendered on the client side; in the SSR environment, the first screen uses reduced-motion / radial gradient fallback without WebGL, and it is necessary to ensure that `fallback` or the default gradient ball is visible on the server.
- Do not actively adjust `loseContext` to poison the canvas during cleanup, otherwise React StrictMode dual-mount reuse of the same canvas will directly collapse and become blank - see [[webgl-canvas-loseContext-poisons-strictmode-remount]]. The correct approach is to mount a new canvas each time.
- The canvas fills the outer container. The outer layer must have a certain width and height (square is best), otherwise the light sphere will collapse and become invisible.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
