---
slug: tablet
name: Tablet
category: mockups
group: device
tags: []
exports: [Tablet, TABLET_MODELS]
status: enriched
---

# Tablet

> Frames content inside a tablet device mockup. · mockups/device

## When to Use

Wrap app/webpage screenshots into iPad series tablet body frames for display, covering iPad Pro/Air/mini series models (the aspect ratios of each model are different). For the phone body, use [iPhone](../iphone/iphone.md)/[Android](../android/android.md), and for the browser window frame, use [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md).

## Import
```ts
import { Tablet, TABLET_MODELS } from "@hulianui/ui"
```

## Props

Inherited from `ComponentPropsWithoutRef<"div">`. `TABLET_MODELS` export model→`{ width, aspectRatio }` mapping constant.

| Name | Type | Default | Description |
|------|------|------|------|
| model | `"ipad-pro-13" \| "ipad-pro-11" \| "ipad-air-11" \| "ipad-10" \| "ipad-mini"` | - | Optional model used to select a predefined width and aspect ratio; the showcase uses `"ipad-pro-11"` |
| width | `number` | Model width or `320` | Device width in pixels; an explicit value overrides the selected model's width |
| imageSrc | `string` | - | Screen image URL; takes precedence over `children` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Custom screen content |

## Examples
```tsx
<Tablet model="ipad-pro-11">
  <img src="/app.png" />
</Tablet>
```

## Usage Guidelines

- **Body height is derived from the screen ratio and the border, never a hard-coded `aspectRatio`.** The border is a fixed pixel value while the screen scales with the width, so the body ratio is not a constant: the same device drawn at 280px and at 360px has two different body ratios. A hard-coded ratio therefore skews the inner screen at some widths, and [PreviewSandbox](../preview-sandbox/preview-sandbox.md) `fit` scaling leaves a white band on the short edge (#117). The logical screen resolution and border width live in `lib/device-metrics`, and a unit test locks the invariant that the inner screen ratio always equals the declared `screen` ratio.

- Unlike iPhone and Android frames, iPad generations really do differ in aspect ratio, so **when `model` is set explicitly** the body ratio comes from that model's `aspectRatio` and `width` only overrides the width. Without `model`, the default tier derives its height from the screen ratio and the border, and [PreviewSandbox](../preview-sandbox/preview-sandbox.md) never passes `model`, so that is the path it takes.
- When both `imageSrc` and `children` are provided, `imageSrc` takes priority.

## Related
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
