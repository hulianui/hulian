---
slug: dome-gallery
name: DomeGallery
category: data-display
group: collection
tags: [animated]
exports: [DomeGallery]
status: enriched
---

# DomeGallery

> Dome gallery · image tiles mapped to the inside of a CSS 3D hemisphere, with drag rotation and click-to-enlarge viewing · native Pointer Events and RAF inertia + Motion lightbox (dependency-free · tokens · reduced-motion support) · data-display/collection · #animated

## When to use

Use DomeGallery for an immersive gallery that maps images to the inside of a 3D hemisphere, rotates by dragging, and opens images for closer viewing—for example, a brand mood wall or portfolio hero. For a curved horizontal track with wheel scrolling and seamless looping, use [CircularGallery](../circular-gallery/circular-gallery.md). For a card wall revealed by a cursor spotlight, use [ChromaGrid](../chroma-grid/chroma-grid.md). For structured tabular data, use [Table](../table/table.md). The component uses CSS 3D and native Pointer Events with no external runtime dependency.

## Import
```ts
import { DomeGallery } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| images | `DomeGalleryImage[]` | Built-in gradient placeholder tiles | Images mapped to the dome, provided as strings or `{ src, alt }` objects. A short list repeats to fill the available tiles; surplus images are not displayed. |
| segments | `number` | `24` | Number of longitudinal dome segments. Larger values produce denser, smaller tiles. |
| fit | `number` | `0.5` | Dome radius relative to the container. Smaller values increase curvature, subject to `minRadius` and `maxRadius`. |
| minRadius | `number` | `380` | Minimum radius in pixels, preventing the dome from collapsing in small containers. |
| maxRadius | `number` | `1600` | Maximum radius in pixels, preventing the dome from appearing too flat on large screens. |
| maxVerticalRotationDeg | `number` | `6` | Maximum vertical `rotateX` angle, limiting vertical rotation so the poles do not come into view. |
| dragSensitivity | `number` | `18` | Drag sensitivity: pixel movement divided by this value becomes the rotation angle. Larger values feel less sensitive. |
| dragDampening | `number` | `0.55` | Post-release inertial dampening from 0 to 1. Larger values glide longer. |
| grayscale | `boolean` | `true` | Whether tiles use a grayscale filter. Enlarged images return to full color. |
| imageBorderRadius | `string` | `"16px"` | Tile border radius as a CSS length. |
| openedImageBorderRadius | `string` | `"24px"` | Image border radius in the enlarged view. |
| overlayColor | `string` | `"var(--color-background)"` | Base color for the edge fade and center mask. Pass a token matching the host background. |
| enlargeTransitionMs | `number` | `320` | Duration in milliseconds for enlarged-view and auto-rotation transitions. |
| autoRotate | `boolean` | `false` | Slowly rotates the dome when it is not being dragged, suitable for displays and ambient backgrounds. |
| className | `string` | — | Class name forwarded to the root element. |
| style | `CSSProperties` | — | Inline styles forwarded to the root element. |

`DomeGalleryImage` is either a `string` or `{ src: string; alt?: string }`.

## Examples
```tsx
<div className="relative h-80 overflow-hidden rounded-xl bg-bg">
  <DomeGallery
    images={[
      { src: "/a.jpg", alt: "Cover A" },
      { src: "/b.jpg", alt: "Cover B" },
    ]}
  />
</div>
```

Ambient auto-rotation with full-color tiles:
```tsx
<DomeGallery autoRotate grayscale={false} segments={20} />
```

The current runtime default for the root gallery label is the Chinese string `"\u53ef\u62d6\u62fd\u65cb\u8f6c\u7684\u7403\u9762\u56fe\u5e93"`, meaning “Draggable rotating dome gallery.” Generated placeholder alts use `"\u56fe\u7247 N"` (“Image N”), tile buttons fall back to `"\u67e5\u770b\u56fe\u7247"` (“View image”), and the enlarged image falls back to `"\u653e\u5927\u67e5\u770b"` (“Enlarged view”). Override these by supplying localized `alt` text where possible.

## Usage notes

- Place DomeGallery in a host with an explicit height and `overflow-hidden`. `minRadius` prevents the dome from collapsing in small containers.
- Match `overlayColor` to the host background. The default is `var(--color-background)`; a mismatch exposes a visible seam around the edge fade.
- A short `images` list repeats to fill all tiles, while items beyond the available tile count are ignored. Estimate the tile count from `segments` before preparing assets.
- Inertial movement and auto-rotation are reduced when the user prefers reduced motion.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
