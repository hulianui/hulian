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
This is a presentational RSC with no interaction state. When both `imageSrc` and `children` are provided, `imageSrc` wins.

## Related
[iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
