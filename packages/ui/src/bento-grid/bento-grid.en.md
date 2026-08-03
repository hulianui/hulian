---
slug: bento-grid
name: BentoGrid
category: data-display
group: collection
tags: []
exports: [BentoGrid, BentoCard]
status: enriched
---

# BentoGrid

> Varied grid · composable BentoGrid and BentoCard with row and column spans, hover CTA, CSS-only rendering, and RSC support · data-display/collection

## When to use

Use BentoGrid for an irregular responsive wall of feature cards on a landing page. Apply span utilities such as `sm:col-span-2` to individual cards. Use [Table](../table/table.md) for tabular data or [ProTable](../pro-table/pro-table.md) for an enterprise list page.

## Import
```ts
import { BentoGrid, BentoCard } from "@hulianui/ui"
```

## Props

### BentoGrid
Inherits `HTMLAttributes<HTMLDivElement>` with no custom props; control columns through `className`.

| Name | Type | Default | Description |
|------|------|------|------|
| ...div | HTMLAttributes\<HTMLDivElement\> | — | Forwarded props, including grid classes. |

### BentoCard
Inherits `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

| Name | Type | Default | Description |
|------|------|------|------|
| ...div | Omit\<HTMLAttributes\<HTMLDivElement\>, "title"\> | — | Forwarded props; use `className` for spans. |

## Slots

### BentoGrid

| Slot | Type | Description |
|------|------|------|
| children | ReactNode | A group of `BentoCard` elements. |

### BentoCard

| Slot | Type | Description |
|------|------|------|
| title | ReactNode | Card title. |
| description | ReactNode | Description. |
| icon | ReactNode | Upper-left icon or decoration. |
| cta | ReactNode | Bottom action area. |
| children | ReactNode | Custom card content. |

## Example
```tsx
import { Zap, Shield } from "lucide-react";

<BentoGrid className="w-full max-w-2xl">
  <BentoCard className="sm:col-span-2" icon={<Zap />} title="Fast" description="CSS-first with no runtime overhead" />
  <BentoCard icon={<Shield />} title="Reliable" description="WAI-ARIA and test coverage" />
</BentoGrid>
```

## Usage notes

- Spans belong in each card's `className`; there is no `span` prop.
- `BentoCard` redefines `title` as visible card content, not an HTML tooltip attribute.
- The components are CSS-only and can render directly in a Server Component.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
