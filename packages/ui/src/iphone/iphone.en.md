---
slug: iphone
name: iPhone
category: mockups
group: device
tags: []
exports: [IPhone, IPHONE_MODELS]
status: enriched
---

# iPhone

> Frames content inside an iPhone-style shell with a Dynamic Island. · mockups/device

## When to Use

Wrap App screenshots/mobile pages into the iPhone body (Smart Island) frame for display. It is commonly used for landing pages and AppStore images. If you want an Android punch-hole screen body, use [Android](../android/android.md), if you want a tablet, use [Tablet](../tablet/tablet.md), if you want a browser window frame, use [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md).

## Import
```ts
import { IPhone, IPHONE_MODELS } from "@hulianui/ui"
```

## Props

Inherited from `ComponentPropsWithoutRef<"div">`. `IPHONE_MODELS` Export model→width mapping constant.

| Name | Type | Default | Description |
|------|------|------|------|
| model | `"16-pro-max" \| "16-pro" \| "16-plus" \| "16" \| "15-pro" \| "13-mini"` | `"15-pro"`(showcase) | Default model, determines the default width. |
| width | `number` | model default, if there is no model, `280` | Device width (px), when passed in explicitly, it takes precedence over model. |
| imageSrc | `string` | - | Screen content image address, taking precedence over children. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Screen content customization node. |

## Examples
```tsx
<IPhone model="15-pro">
  <img src="/app.png" />
</IPhone>
```

## Usage Guidelines

- **Body height is derived from the screen ratio and the border, never a hard-coded `aspectRatio`.** The border is a fixed pixel value while the screen scales with the width, so the body ratio is not a constant: the same device drawn at 280px and at 360px has two different body ratios. A hard-coded ratio therefore skews the inner screen at some widths, and [PreviewSandbox](../preview-sandbox/preview-sandbox.md) `fit` scaling leaves a white band on the short edge (#117). The logical screen resolution and border width live in `lib/device-metrics`, and a unit test locks the invariant that the inner screen ratio always equals the declared `screen` ratio.

- `model` and `width` change only the body width; the height follows from the screen ratio, so the body aspect ratio shifts slightly with width. That is correct behaviour, because the border does not scale. Clip at an outer layer if you need a different shape.
- When both `imageSrc` and `children` are provided, `imageSrc` takes precedence.

## Related
[Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
