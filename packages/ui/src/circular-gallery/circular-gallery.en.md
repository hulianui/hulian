---
slug: circular-gallery
name: CircularGallery
category: data-display
group: collection
tags: [animated, webgl]
exports: [CircularGallery]
status: enriched
---

# CircularGallery

> Curved image gallery · an ogl-powered image track with cards arranged and tilted along an arc, inertial wheel and drag scrolling, and seamless looping (rounded-corner SDF · token-based titles · static reduced-motion fallback) · data-display/collection · #animated

## When to use

Use CircularGallery when you need a WebGL image track that bends along an arc, responds to wheel and drag gestures with inertia, and loops seamlessly, for example in portfolio browsers or brand showcases. For a draggable 3D gallery mapped to the inside of a hemisphere, use [DomeGallery](../dome-gallery/dome-gallery.md). For a card wall revealed by a cursor spotlight, use [ChromaGrid](../chroma-grid/chroma-grid.md). For structured tabular data, use [Table](../table/table.md). This client component is built on ogl. When an item has no image, it generates an offline placeholder from chart tokens.

## Import
```ts
import { CircularGallery } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `CircularGalleryItem[]` | Built-in placeholder cards | Gallery items containing an image and title. An omitted or empty array uses programmatic gradient placeholders based on chart tokens, with no remote assets. |
| bend | `number` | `3` | Arc curvature. `0` is flat, positive values curve downward, and negative values curve upward. A range of -6 to 6 is recommended. |
| textColor | `string` | `var(--color-foreground)` | Title color. Accepts any CSS color or `var(--color-*)` token, which is resolved to a concrete color before being passed to the canvas. |
| borderRadius | `number` | `0.05` | Normalized card radius from 0 to 0.5. `0` is square and `0.5` is pill-shaped or circular. |
| scrollSpeed | `number` | `2` | Wheel and drag sensitivity. Larger values move farther per gesture. |
| scrollEase | `number` | `0.05` | Inertial lerp factor from 0 to 1. Smaller values feel heavier and smoother. |
| font | `string` | `bold 30px ui-sans-serif, system-ui, sans-serif` | Canvas font shorthand for titles. The default system font stack needs no network request and never goes missing during SSR. |
| className | `string` | - | Class name forwarded to the root container. |

`CircularGalleryItem`

| Name | Type | Default | Description |
|------|------|------|------|
| image | `string` | Programmatic gradient placeholder | Card image URL (remote URL, data URI, or local static asset). When omitted, the component generates a gradient placeholder from chart tokens that works offline and follows the light or dark theme. |
| text * | `string` | - | Title shown below the card. |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `React.ReactNode` | Fallback rendered above the static placeholder layer when reduced motion is enabled or WebGL is unavailable. |

## Examples
```tsx
<div className="relative h-72 overflow-hidden rounded-xl">
  <CircularGallery
    items={[
      { text: "Hansu" },
      { text: "Helm" },
      { text: "Fleet" },
      { text: "Pay" },
    ]}
  />
</div>
```

Flat layout with a custom title color:
```tsx
<CircularGallery bend={0} textColor="var(--color-chart-2)" items={items} />
```

## Usage notes

- CircularGallery uses ogl and WebGL, so it is a client component. Place it in a host with an explicit height and `overflow-hidden`, and render it only on the client in SSR or RSC applications.
- Use a `var(--color-*)` token for a theme-aware `textColor`. The component resolves the token before passing the color to the canvas; bare token names cannot be resolved there.
- A static track is the expected fallback when reduced motion is enabled or WebGL is unavailable. Use `fallback` to add custom fallback content.
- Headless screenshots can look empty when the WebGL animation has not advanced past its first frame. Use a real browser or allow a few frames to render before visual capture.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
