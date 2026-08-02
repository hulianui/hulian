---
slug: chrome
name: Chrome
category: mockups
group: window
tags: []
exports: [Chrome]
status: enriched
---

# Chrome

> Browser Shell · Tab + Toolbar (Forward/Back/Refresh + Address Bar) Package Screenshot + RSC · Mockups/window

## When to Use

Use it to frame a web screenshot or live view in a Chrome-style window with a tab title and navigation toolbar. It conveys more browser context than Safari and works well when a product image should clearly look browser-based. Use [Safari](../safari/safari.md) for a minimal traffic-light frame, [Terminal](../terminal/terminal.md) for a command-line window, or [iPhone](../iphone/iphone.md), [Android](../android/android.md), and [Tablet](../tablet/tablet.md) for device frames.

## Import
```ts
import { Chrome } from "@hulianui/ui"
```

## Props

Extends `ComponentPropsWithoutRef<"div">`, forwarding `className`, `style`, and other native attributes. Width is commonly set with `style={{ width }}`.

| Name | Type | Default | Description |
|------|------|------|------|
| url | `string` | `"hulian.design"` | Address bar text. |
| title | `string` | Get the url | tab title. |
| imageSrc | `string` | — | The image address of the content area, taking precedence over children. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Custom node in the content area (rendered when imageSrc is not passed). |

## Examples
```tsx
<Chrome url="hulian.design" title="Hulian" style={{ width: 375 }}>
  <img src="/screenshot.png" />
</Chrome>
```

## Usage Guidelines

- This presentational shell has no default width. Set one with `style={{ width }}` or `className`, or it shrinks to its content width.
- When both `imageSrc` and `children` are provided, `imageSrc` wins and `children` is ignored.

## Related
[Safari](../safari/safari.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
