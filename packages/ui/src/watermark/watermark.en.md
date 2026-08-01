---
slug: watermark
name: Watermark
category: data-display
group: placeholder
tags: []
exports: [Watermark]
status: enriched
---

# Watermark

> A high-DPI tiled canvas watermark with text or image content and MutationObserver tamper recovery.

## When to use

Use Watermark over a sensitive content region to discourage screenshot leakage. Wrap the protected `children`; use [Empty](../empty/empty.md) for no data or [Skeleton](../skeleton/skeleton.md) while loading.

## Import
```ts
import { Watermark } from "@hulianui/ui"
```

## Props

Inherits all native `div` attributes except `content`, which is redefined as a string or string array.

| Name | Type | Default | Description |
|------|------|------|------|
| content | `string \| string[]` | — | One or multiple text lines; `image` takes precedence when both are supplied. |
| image | `string` | — | Data URL or remote image source. |
| width | `number` | `120` | Image width in pixels. |
| height | `number` | Original aspect ratio | Image height in pixels. |
| rotate | `number` | `-22` | Rotation in degrees. |
| gap | `number \| [number, number]` | `100` | Shared x/y spacing or explicit `[x, y]` spacing in pixels. |
| fontSize | `number` | `16` | Text size in pixels. |
| fontFamily | `string` | `sans-serif` | Font family. |
| fontWeight | `number \| string` | `normal` | Font weight. |
| color | `string` | `--color-muted` | Watermark color; omission follows the semantic theme token. |
| opacity | `number` | `0.15` | Overall opacity. |
| zIndex | `number` | `9` | Overlay z-index; pointer events remain disabled. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Protected content region. |

## Examples
```tsx
// Single line
<Watermark content="Hulian / Confidential">
  <Sheet />
</Watermark>

// Multiple lines with custom density and color
<Watermark content={["Hulian Confidential", "zhangzhiwei"]} gap={48} rotate={-30} color="var(--color-danger)">
  <Sheet />
</Watermark>

// Image watermark
<Watermark image={logoDataUri} width={84}>
  <Sheet />
</Watermark>
```

## Pitfalls

- SVG and canvas colors require full `--color-` token names such as `var(--color-danger)`; bare `var(--danger)` does not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Canvas tiling and MutationObserver require a client environment. A pure static SSR screenshot may occur before the watermark is drawn; verify in a real browser.
- `image` takes precedence over `content`; omit it when text should render.

## Related
[Empty](../empty/empty.md) · [Skeleton](../skeleton/skeleton.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
