---
slug: click-spark
name: ClickSpark
category: decoration
group: overlay-fx
tags: [animated]
exports: [ClickSpark]
status: enriched
---

# ClickSpark

> Click on sparks · Click on the interactive background wrapper that bursts out sparks · Click on the point to emit a circle of short line segments that spread slowly along the angle + quantity/radius/length/duration/easing are fully adjustable (canvas2d+RAF zero dependency·token color selection·reduced-motion silent·RSC safety·jsdom safety) · decoration/overlay-fx · #animated

## When to Use

Use it to emit a radial spark burst wherever someone clicks inside a button area, card, or interactive hero. It is a wrapper, so clicks on its content define each burst origin. Use [BlobCursor](../blob-cursor/blob-cursor.md) for a liquid cursor trail, [Antigravity](../antigravity/antigravity.md) for a full particle field, or [Crosshair](../crosshair/crosshair.md) for target tracking.

## Import
```ts
import { ClickSpark } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sparkColor | `string` | `var(--color-foreground)` | Spark color (automatic light and dark theme), can pass any CSS color |
| sparkSize | `number` | `10` | Initial spark-segment length in pixels; higher values create bolder strokes |
| sparkRadius | `number` | `15` | The maximum radius of sparks flying (px), determines the burst range |
| sparkCount | `number` | `8` | The number of sparks emitted by one click (average 360°) |
| duration | `number` | `400` | Spark animation duration in milliseconds; higher values leave a longer-lived trail |
| easing | `"linear" \| "ease-in" \| "ease-out" \| "ease-in-out"` | `"ease-out"` | Sparks fly out of the easing curve |
| extraScale | `number` | `1` | Radius extra scaling factor, >1 for amplified burst, <1 for convergence |
| className | `string` | — | Transparent to the root container (relative DOM element) |
| style | `CSSProperties` | — | Inline styles forwarded to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Package content, click anywhere within it and sparks will burst out at the click point |

## Examples
```tsx
//Default: foreground color sparks, click anywhere in the area to radiate
<div className="relative h-56 overflow-hidden rounded-xl">
  <ClickSpark className="absolute inset-0">
<div className="flex h-full items-center justify-center">Click here to emit sparks</div>
  </ClickSpark>
</div>

// Big explosion (multiple sparks + long line segments + large radius + token color selection)
<ClickSpark sparkColor="var(--color-chart-1)" sparkCount={16} sparkSize={18} sparkRadius={36}>
  <Hint />
</ClickSpark>
```

## Usage Guidelines

- The token used for `sparkColor` must be prefixed with `--color-` (`var(--color-foreground)`), and the canvas strokeStyle feed `var(--foreground)` does not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- It is a wrapper: sparks are only triggered when clicked in the wrapped `children` area; the root container must be the positioning context (relative).
- No sparks are released silently under reduced-motion; the RSC/jsdom environment is safe (no errors are reported), but the actual sparks require the browser to run.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
