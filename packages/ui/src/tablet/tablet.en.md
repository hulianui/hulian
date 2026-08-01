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

> Tablet case · iPad system body (model default size/proportion·token themeable) + RSC · mockups/device

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
| model | `"ipad-pro-13" \| "ipad-pro-11" \| "ipad-air-11" \| "ipad-10" \| "ipad-mini"` | — | Optional model used to select a predefined width and aspect ratio; the showcase uses `"ipad-pro-11"` |
| width | `number` | Model width or `320` | Device width in pixels; an explicit value overrides the selected model's width |
| imageSrc | `string` | — | Screen content image address, taking precedence over children. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Screen content customization node. |

## Examples
```tsx
<Tablet model="ipad-pro-11">
  <img src="/app.png" />
</Tablet>
```

## Usage Guidelines

- Unlike iPhone and Android frames, tablet models use different aspect ratios selected by `model`. An explicit `width` changes only the width; the aspect ratio still follows the model. Without `model`, the width falls back to 320 and no model-specific ratio is applied.
- When `imageSrc` and `children` are transmitted simultaneously, `imageSrc` takes priority.

## Related
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
