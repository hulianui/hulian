---
slug: iridescence
name: Iridescence
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Iridescence]
status: enriched
---

# Iridescence

> Iridescent glossy background · WebGL/ogl shader continuous spectral interference + pointer optical flow perturbation + chart token + static fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a continuous spectrum/oil film-like iridescent glossy background, and want pointer optical flow disturbance interaction. Based on WebGL/ogl, it has GPU overhead and does not come with WebGL fallback; it is a WebGL texture background like [Silk](../silk/silk.md), Silk is more silky flowing, and this component is more iridescent spectrum interference; if you don’t want to introduce WebGL, use pure CSS [Aurora](../aurora/aurora.md).

## Import
```ts
import { Iridescence } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `[number, number, number] \| string` | `--color-chart-3` | Base tint as a 0-1 RGB tuple or CSS color. When omitted, the component reads the theme chart token |
| speed | number | 1.0 | Animation speed magnification, recommended 0.1-5 |
| amplitude | number | 0.1 | Pointer offset amplitude (disturbance intensity), recommended 0.01-0.5 |
| mouseReact | boolean | true | Responds to pointer and touch through `uPointer`; when false, the coordinate stays at (0.5, 0.5) |
| className | string | - | Forwarded to canvas or fallback container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | ReactNode | reduced-motion / static fallback content without WebGL |

## Examples
```tsx
//Default theme color, comes with full canvas, requires relative + overflow-hidden parent container
<div className="relative h-56 overflow-hidden rounded-xl">
  <Iridescence />
</div>
```
```tsx
// Custom cold blue (RGB array) + high-speed strong disturbance
<Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2} />
```

## Usage Guidelines

- WebGL component, which must be rendered by the client; `color` receives both the `[r,g,b]` array of 0..1 and the CSS string (including `var(--…)`/oklch), which is parsed internally by the component.
- ogl/WebGL is easy to step into the context reuse poison pit when double mounting in StrictMode or cleanup - when changing the source code, do not cleanup and adjust `loseContext` and then reuse the same canvas (see [[webgl-canvas-loseContext-poisons-strictmode-remount]]); headless screenshots will fallback when there is no WebGL, use a real browser for visual verification.
- The parent container requires `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
