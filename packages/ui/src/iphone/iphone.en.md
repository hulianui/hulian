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

> Mobile phone case · Smart island body wrapped screen (token themeable) + RSC · mockups/device

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
| imageSrc | `string` | — | Screen content image address, taking precedence over children. |

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

- The proportion of the fuselage is uniformly fixed by `aspectRatio` in the component. `model`/`width` only changes the width but not the aspect ratio; if you want other proportions, you need to cut the outer layer yourself.
- When both `imageSrc` and `children` are provided, `imageSrc` takes precedence.

## Related
[Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md) · [Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
