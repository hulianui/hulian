---
slug: book-3d
name: Book3D
category: data-display
group: collection
tags: [animated]
exports: [Book3D]
status: enriched
---

# Book3D

> 3D book · CSS perspective cover, spine, page block, and back cover with image or gradient artwork, titles, ribbon, hover opening, GPU transforms, and reduced-motion support · data-display/collection · #animated

## When to use

Use Book3D for a dimensional book in a portfolio, bookshelf, or cover wall. It is decorative rather than tabular: use [Table](../table/table.md) or [PricingTable](../pricing-table/pricing-table.md) for data, and [List](../list/list.md) for a regular grid.

## Import
```ts
import { Book3D } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| cover | `string` | — | Cover image URL, taking precedence over `coverColor`. |
| logo | `string` | — | Product logo or app icon centered on the cover. |
| coverColor | `{ from: string; to: string }` | Brand gradient | Cover gradient. |
| spineColor | `string` | `"#efe9dd"` | Light paper color used for the spine and page block. |
| thickness | `string` | `"2.25rem"` | Spine thickness as a CSS length. |
| ribbon | `string` | — | Corner ribbon such as `"NEW"` or `"N°1"`. |
| ribbonTone | `"brand" \| "danger" \| "success"` | `"danger"` | Ribbon tone. |
| href | `string` | — | Makes the whole book a link. |
| target | `string` | — | Link target when `href` is present. |
| className | `string` | — | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `() => void` | Makes the book a button when `href` is absent. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Main cover title. |
| subtitle | `ReactNode` | Cover subtitle. |
| inside | `ReactNode` | Inside-page content revealed when the front cover opens on hover. |

## Examples
```tsx
<div className="flex flex-wrap gap-8">
  <Book3D title="CSS" subtitle="TRANSFORMS" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
  <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }} />
  <Book3D title="HTML" subtitle="5" ribbon="N°1" ribbonTone="danger" coverColor={{ from: "#e0654a", to: "#c14a32" }} />
</div>

<Book3D title="Hulian" subtitle="hulianui" />
```

## Usage notes

- `cover` overrides `coverColor` when both are supplied.
- The hover opening is CSS-only and automatically degrades under reduced motion; do not wrap it in another JavaScript animation.
- `href` and `onClick` are alternatives: `href` renders an anchor, otherwise `onClick` renders a button.

## Related
[Table](../table/table.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
