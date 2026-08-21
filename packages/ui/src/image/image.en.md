---
slug: image
name: Image
category: data-display
group: collection
tags: []
exports: [Image, imageVariants]
status: enriched
---

# Image

> Loads images with fade-in, fallback, radius, and optional hover zoom. · data-display/collection

## When to use

Use Image instead of a raw `<img>` when a cover, avatar, or content image needs fade-in, failure fallback, radius, or hover zoom. Use [Marquee](../marquee/marquee.md) for a decorative logo wall, or ImageViewer for fullscreen zoom.

## Import
```ts
import { Image, imageVariants } from "@hulianui/ui"
```

## Props

Inherits `Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height">`.

| Name | Type | Default | Description |
|------|------|------|------|
| src * | string | - | Image URL. |
| alt | string | `""` | Alternative text; empty by default, so provide meaningful text unless the image is decorative. |
| width | number \| string | - | Numeric width or CSS length. |
| height | number \| string | - | Numeric height or CSS length. |
| radius | `"none"\|"sm"\|"md"\|"lg"\|"full"` | `"md"` | Radius scale. |
| isZoomed | boolean | false | Scales on hover within the clipped wrapper. |
| fallbackSrc | string | - | Failure fallback URL; omission shows the placeholder surface. |
| className | string | - | Wrapper class controlling dimensions and clipping. |
| imgClassName | string | - | Inner `<img>` class. |
| ...img | Omit\<ImgHTMLAttributes, "width"\|"height"\> | - | Remaining native image props. |

## Examples
```tsx
<Image src="/photo.jpg" alt="Landscape" width={220} height={140} />

<Image src="/photo.jpg" alt="Landscape" width={200} height={130} isZoomed />

<Image src="https://invalid.example/none.png" fallbackSrc="/photo.jpg" alt="Fallback" width={200} height={130} />
```

## Usage notes

- Hover zoom relies on wrapper clipping and dimensions; do not move overflow control to `imgClassName`.
- `radius` styles the wrapper. Combine `radius="full"` with equal dimensions for an avatar.
- Consumer `onLoad` and `onError` are merged with internal fade and fallback behavior. This fixes [issue #55](https://github.com/hulianui/hulian/issues/55).
- The forwarded ref targets the inner `<img>` for natural dimensions or intersection logic, matching [Input](../input/input.md).
- Candidate image-related skills describe application workflows rather than this component and are intentionally not linked.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
