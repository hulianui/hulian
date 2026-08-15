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
| headerExtra | `ReactNode` | — | Tool entry at the trailing edge of the chrome (share, download, and the like). When omitted the cell stays the `w-6` spacer from the original layout, byte for byte; when provided the cell is handed over, with its width floored at the spacer width. See "Live content". |

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

### Live content (not just screenshots)

The content area sits on the height chain: the root is a column flex container and the content area is `min-h-0 flex-1`. So "shell fills its parent, content takes the height left over by the chrome" only needs a height on the root — embedded live pages, native views (Electron's `WebContentsView`), and scrollable panels all rely on this:

```tsx
<div style={{ height: 500 }}>
  <Chrome url="zwfw.example.gov.cn" className="h-full" headerExtra={<DownloadButton />}>
    <div ref={viewportRef} className="h-full" />   {/* measured and fed to setBounds in the main process */}
  </Chrome>
</div>
```

Screenshot usage is unaffected: an auto-height column flex container is still sized by its content, and `min-h-0` does not collapse it to zero — verified in Chromium.

The trailing cell in the toolbar is an empty `w-6` spacer by default. Passing `headerExtra` hands that cell over, with its width floored at the spacer width: narrower content keeps the symmetry exactly, wider content grows the cell — better an off-center capsule than a clipped button.

## Related
[Safari](../safari/safari.md) · [Terminal](../terminal/terminal.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
