---
slug: fit-screen
name: FitScreen
category: layout
group: container
tags: []
exports: [FitScreen, computeFit]
status: enriched
---

# FitScreen

> Scales a fixed design canvas to fit, cover, or stretch within its container. · layout/container

## When to use

Use FitScreen when content has been laid out against a fixed design canvas, such as a 1920×1080 operations dashboard, and the entire canvas must scale within an arbitrary parent. Use [Viewport](../viewport/viewport.md) when content should reflow at container breakpoints instead of scaling, or [AspectRatio](../aspect-ratio/aspect-ratio.md) when a single element only needs a fixed ratio.

## Import
```ts
import { FitScreen, computeFit } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| designWidth | `number` | `1920` | Design-canvas width. |
| designHeight | `number` | `1080` | Design-canvas height. |
| mode | `"fit" \| "cover" \| "stretch"` | `"fit"` | `fit` preserves the full canvas and may letterbox; `cover` fills the parent and may crop edges; `stretch` fills both axes and may distort content. |
| className | `string` | - | The outer container class name. |

`computeFit(input: FitInput)` is the pure scaling function used after ResizeObserver measures the parent. It accepts `{ outerW, outerH, designW, designH, mode }` and can be tested independently.

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Content laid out at the fixed design dimensions. |

## Examples
```tsx
// Scale a 1920×1080 dashboard to fit the parent without cropping
<FitScreen designWidth={1920} designHeight={1080} mode="fit">
  {/* Position dashboard content within the 1920×1080 design canvas */}
</FitScreen>
```

```tsx
// Cover the parent without letterboxing; edges may be cropped
<FitScreen mode="cover">
  <DesignBoard />
</FitScreen>
```

## Usage guidelines

- **Scaling uses `transform: scale`.** Headless/CDP screenshot coordinates may not align with real click geometry. Account for this in visual and interaction tests; see [[recharts-headless-screenshot-blank-clippath-animation-starved]] and [[turbopack-dev-cold-route-blank-cdp-screenshot-warm-first]]. Use `dispatchEvent` if coordinate clicks are inaccurate.
- **Guard detached refs before writing styles.** During StrictMode remounts, `<Activity>`, or Offscreen reconnection, `ref.current` can remain truthy after its style target is detached. See [[react-offscreen-reconnect-detached-ref-style-crash]]; check `if (!el?.style) return` before writing.
- Keep `designWidth` and `designHeight` consistent with the dimensions used to lay out the children. A mismatch produces the wrong scale and can cause clipping or unexpected empty space.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
