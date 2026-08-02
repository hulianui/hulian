---
slug: image-viewer
name: ImageViewer
category: data-display
group: info
tags: []
exports: [ImageViewer]
status: enriched
---

# ImageViewer

> Image viewer · fullscreen controlled lightbox with paging, pointer-anchored wheel zoom, double-click zoom, drag pan, thumbnails, dialog semantics, and scroll locking · data-display/info

## When to use

Use ImageViewer for fullscreen album, work-photo, or attachment inspection. Use [Sparkline] for an inline trend or [LiveProductCard] for commerce content.

## Import
```ts
import { ImageViewer } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| open* | `boolean` | — | Controlled visibility. |
| images* | `ImageViewerImage[]` | — | `{src, alt?, caption?}` images. |
| index* | `number` | — | Controlled current image index. |
| className | `string` | — | Panel class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onOpenChange* | `(open: boolean) => void` | Close request from Escape, overlay, or close control. |
| onIndexChange* | `(index: number) => void` | Paging request from controls, keyboard, or thumbnails. |

## Example
```tsx
const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);
<ImageViewer open={open} onOpenChange={setOpen}
  images={[{ src: "/a.jpg", alt: "A", caption: "Description" }, { src: "/b.jpg", alt: "B" }]}
  index={index} onIndexChange={setIndex} />
```

## Usage notes

- Both open and index are controlled; write callback values to state.
- Scale and offset reset when index or open changes and should not be cached externally.
- Only the current large image renders. Reset index to the intended thumbnail before opening.
- Built-in accessibility labels remain Chinese at runtime: `"\u5173\u95ed\u56fe\u7247\u67e5\u770b\u5668"` ("Close image viewer"), `"\u4e0a\u4e00\u5f20"` ("Previous image"), `"\u4e0b\u4e00\u5f20"` ("Next image"), and `` `\u67e5\u770b\u7b2c ${i + 1} \u5f20` `` ("View image N").

## Related
[Sparkline](../sparkline/sparkline.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
