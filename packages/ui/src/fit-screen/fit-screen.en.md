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

> Fixed-canvas scaling · Centers a 1920×1080 design by default and scales it with fit, cover, or stretch, using testable `computeFit`, ResizeObserver, and SSR-safe behavior · layout/container

## When to use

Use FitScreen for a fixed-size design such as a 1920×1080 data dashboard that must scale and center inside any parent container. It scales a fixed canvas; use [Viewport](../viewport/viewport.md) when content should reflow at container breakpoints, or [AspectRatio](../aspect-ratio/aspect-ratio.md) when only one element needs a fixed ratio.

## Import
```ts
import { FitScreen, computeFit } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| designWidth | `number` | `1920` | Design-canvas width. |
| designHeight | `number` | `1080` | Design-canvas height. |
| mode | `"fit" \| "cover" \| "stretch"` | `"fit"` | fit = take min (no cropping in equal proportions, black edges may be left around); cover = take max (cover in equal proportions, may be cropped); stretch = stretch in non-equal proportions (may deform). |
| className | `string` | — | The outer container class name. |

`computeFit(input: FitInput)`: Pure function (`{ outerW, outerH, designW, designH, mode }` → scaling result), which can be tested individually. It is called after the internal measurement of ResizeObserver in the component.

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Your fixed design size for large screen content. |

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
- The size of the design draft (designWidth/Height) must be consistent with the actual absolute layout size of children, otherwise the scaling ratio will be incorrectly calculated and the content will overflow or be left blank.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
