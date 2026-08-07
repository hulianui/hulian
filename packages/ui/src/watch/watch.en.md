---
slug: watch
name: Watch
category: mockups
group: device
tags: []
exports: [Watch, WATCH_MODELS]
status: enriched
---

# Watch

> Watch case · Apple Watch series squircle case + digital crown (model default size) + RSC · mockups/device

## When to Use

Use it to present a screenshot or rendered watch UI inside an Apple Watch-style case. Pair it with [iPhone](../iphone/iphone.md) and [Tablet](../tablet/tablet.md) device frames when a product story spans phone, tablet, and watch surfaces.

## Import
```ts
import { Watch, WATCH_MODELS } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `model` | `"ultra-49" \| "series-45" \| "se-44" \| "series-41"` | — | Optional model used to resolve the case width; the component itself has no model default |
| `width` | `number` | Model width, or `184` without a model | Case width in pixels; an explicit value takes precedence over `model` |
| `imageSrc` | `string` | — | The image address of the dial content, taking precedence over children |

> Extends `ComponentPropsWithoutRef<"div">`, forwarding `className`, `style`, and other native attributes. `WATCH_MODELS` exports widths for `ultra-49` (210), `series-45` (190), `se-44` (184), and `series-41` (172).

## Slots

| Slot | Type | Description |
|------|------|------|
| `children` | `ReactNode` | Dial content rendered when `imageSrc` is not provided |

## Examples
```tsx
<Watch model="series-45">
  <img src="/face.png" />
</Watch>
```

## Usage Guidelines

- **Body height is derived from the screen ratio and the border, never a hard-coded `aspectRatio`.** The border is a fixed pixel value while the screen scales with the width, so the body ratio is not a constant: the same device drawn at 280px and at 360px has two different body ratios. A hard-coded ratio therefore skews the inner screen at some widths, and [PreviewSandbox](../preview-sandbox/preview-sandbox.md) `fit` scaling leaves a white band on the short edge (#117). The logical screen resolution and border width live in `lib/device-metrics`, and a unit test locks the invariant that the inner screen ratio always equals the declared `screen` ratio.
This is a presentational RSC with no interaction state. When both `imageSrc` and `children` are provided, `imageSrc` wins.

## Related
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
