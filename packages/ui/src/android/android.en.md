---
slug: android
name: Android
category: mockups
group: device
tags: []
exports: [Android, ANDROID_MODELS]
status: enriched
---

# Android

> Android shell · Hole camera body wraps the screen + RSC · mockups/device

## When to Use

Use it to present an app screenshot or mobile page inside an Android device frame with a hole-punch camera. Pixel and Galaxy dimensions are available. Use [iPhone](../iphone/iphone.md) for an iPhone frame, [Tablet](../tablet/tablet.md) for a tablet, or [Safari](../safari/safari.md) and [Chrome](../chrome/chrome.md) for browser windows.

## Import
```ts
import { Android, ANDROID_MODELS } from "@hulianui/ui"
```

## Props

Extends `ComponentPropsWithoutRef<"div">`. `ANDROID_MODELS` exports the model-to-width mapping.

| Name | Type | Default | Description |
|------|------|------|------|
| model | `"pixel-9-pro-xl" \| "pixel-9-pro" \| "pixel-9" \| "galaxy-s24-ultra" \| "galaxy-s24"` | — (`"pixel-9-pro"` in the showcase) | Optional model used to resolve the width; the component itself has no model default |
| width | `number` | Model width, or `280` without a model | Device width in pixels; an explicit value takes precedence over `model` |
| imageSrc | `string` | — | Screen image URL; takes precedence over `children` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Custom screen content |

## Examples
```tsx
<Android model="pixel-9-pro">
  <img src="/app.png" />
</Android>
```

## Usage Guidelines

- **Body height is derived from the screen ratio and the border, never a hard-coded `aspectRatio`.** The border is a fixed pixel value while the screen scales with the width, so the body ratio is not a constant: the same device drawn at 280px and at 360px has two different body ratios. A hard-coded ratio therefore skews the inner screen at some widths, and [PreviewSandbox](../preview-sandbox/preview-sandbox.md) `fit` scaling leaves a white band on the short edge (#117). The logical screen resolution and border width live in `lib/device-metrics`, and a unit test locks the invariant that the inner screen ratio always equals the declared `screen` ratio.

- `model` and `width` change only the body width; the height follows from the screen ratio, so the body aspect ratio shifts slightly with width. That is correct behaviour, because the border does not scale.
- When both `imageSrc` and `children` are provided, `imageSrc` wins.

## Related
[iPhone](../iphone/iphone.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
