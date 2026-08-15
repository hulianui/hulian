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
| headerExtra | `ReactNode` | — | Tool entry at the trailing edge of the chrome (share, download, and the like). When omitted the cell stays the `w-12` spacer that keeps the address capsule centered, byte for byte; when provided the cell is handed over, with its width floored at the spacer width. See "Live content". |

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

### Live content (not just screenshots)

The content area sits on the height chain: the root is a column flex container and the content area is `min-h-0 flex-1`. So "shell fills its parent, content takes the height left over by the chrome" only needs a height on the root — embedded live pages, native views (Electron's `WebContentsView`), and scrollable panels all rely on this:

```tsx
<div style={{ height: 500 }}>
  <Safari url="zwfw.example.gov.cn" className="h-full" headerExtra={<DownloadButton />}>
    <div ref={viewportRef} className="h-full" />   {/* measured and fed to setBounds in the main process */}
  </Safari>
</div>
```

Screenshot usage is unaffected: an auto-height column flex container is still sized by its content, and `min-h-0` does not collapse it to zero — verified in Chromium.

The trailing cell in the chrome is an empty `w-12` spacer by default; it exists so the address capsule stays centered relative to the traffic lights. Passing `headerExtra` hands that cell over, with its width floored at the spacer width: narrower content keeps the symmetry exactly, wider content grows the cell — better an off-center capsule than a clipped button.

## Related
[Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
