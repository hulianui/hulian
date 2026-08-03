---
slug: safari
name: Safari
category: mockups
group: window
tags: []
exports: [Safari]
status: enriched
---

# Safari

> Browser mockup · Safari-style traffic lights + address bar + screenshot or custom content + RSC-safe · mockups/window

## When to Use

Wrap webpage screenshots/live content into a macOS Safari-style window frame for landing page display and document illustration. It only has a minimalist top bar with traffic lights + address bar; if you want tabs + forward/back/refresh toolbar, use [Chrome](../chrome/chrome.md), if you want command line style, use [Terminal](../terminal/terminal.md), and if you want mobile phone/tablet body, use [iPhone](../iphone/iphone.md)/[Tablet](../tablet/tablet.md).

## Import
```ts
import { Safari } from "@hulianui/ui"
```

## Props

Inherits `ComponentPropsWithoutRef<"div">`; `className`, `style`, and other div props are forwarded. Use `style={{ width }}` or a width utility to size the frame.

| Name | Type | Default | Description |
|------|------|------|------|
| url | `string` | `"hulian.design"` | Address bar text. |
| imageSrc | `string` | — | The image address of the content area, taking precedence over children. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Custom node in content area (rendered when imageSrc is not passed). |

## Examples
```tsx
<Safari url="hulian.design" style={{ width: 375 }}>
  <img src="/screenshot.png" />
</Safari>
```

## Usage Guidelines

- The shell has no default width. Set one through `style` or `className`; otherwise it shrinks to its content.
- When both `imageSrc` and `children` are provided, `imageSrc` takes precedence and children are ignored.

## Related
[Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
