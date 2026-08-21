---
slug: flying-posters
name: FlyingPosters
category: data-display
group: collection
tags: [animated]
exports: [FlyingPosters]
status: enriched
---

# FlyingPosters

> WebGL poster corridor · an endlessly looping vertical poster strip driven by wheel or drag input, with shader distortion, perspective depth, lazy-loaded ogl, and a static reduced-motion fallback · data-display/collection · #animated

## When to use

Use FlyingPosters for an immersive corridor of same-ratio posters or covers, such as a landing-page hero or gallery entrance. Choose it for true 3D folding and perspective depth. Use [TiltedCard](../tilted-card/tilted-card.md) for a 2D card that tilts on hover, or [ScrollStack](../scroll-stack/scroll-stack.md) for scroll-pinned stacking cards.

## Import
```ts
import { FlyingPosters } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `string[]` | `[]` | Poster image URLs joined into an infinite loop. Same-ratio images are recommended; an empty array renders an empty canvas safely. |
| planeWidth | `number` | `320` | Poster plane width in world units. |
| planeHeight | `number` | `320` | Poster plane height in world units. |
| distortion | `number` | `3` | Scroll-driven folding strength. Values from 1 to 6 are recommended; 0 is nearly flat translation. |
| scrollEase | `number` | `0.01` | Scroll lerp factor from 0 to 1. Smaller values create longer, heavier inertia. |
| cameraFov | `number` | `45` | Perspective camera field of view in degrees. |
| cameraZ | `number` | `20` | Camera distance on the Z axis. Larger values reveal more posters. |
| autoScroll | `boolean` | `true` | Slowly scrolls without input; forced off under reduced motion. |
| autoScrollSpeed | `number` | `0.6` | Auto-scroll speed in world units per second. |
| className | `string` | - | Class name forwarded to the root. |
| style | `CSSProperties` | - | Inline styles forwarded to the root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Content centered in the static layer when reduced motion is enabled or WebGL is unavailable. |

## Examples
```tsx
// The host supplies the size; the component fills it.
<div className="relative h-80 w-full overflow-hidden rounded-xl">
  <FlyingPosters items={posters} className="absolute inset-0" />
</div>

// Strong folding and a wide perspective.
<FlyingPosters items={posters} distortion={5} cameraFov={70} cameraZ={26} />
```

## Usage notes

- The root must have measurable dimensions, such as `absolute inset-0` inside a fixed-height positioned parent.
- WebGL is client-only. ogl is lazy-loaded with SSR and StrictMode safeguards; unavailable WebGL and reduced motion use the static `fallback` layer.
- [[webgl-canvas-loseContext-poisons-strictmode-remount]]: do not cache and reuse the component's canvas across StrictMode remounts, because a lost context permanently invalidates that canvas.
- [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]] / [[recharts-headless-screenshot-blank-clippath-animation-starved]]: a headless capture may stop before the WebGL entrance advances and appear blank. Verify in a real browser or enable reduced motion.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
