---
slug: reflective-card
name: ReflectiveCard
category: data-display
group: collection
tags: [animated]
exports: [ReflectiveCard]
status: enriched
---

# ReflectiveCard

> Metallic reflective ID card · diagonal sheen, frosted noise, gradient hairline border, CSS-only token styling, RSC safety, reduced-motion support, and replaceable content · data-display/collection · #animated

## When to use

Use ReflectiveCard for a metallic ID, membership, or profile card with built-in title, subtitle, badge, and footer fields. Pass `children` to replace that layout. Use Card for ordinary content, [PricingTable](../pricing-table/pricing-table.md) for plan comparison, or [Book3D](../book-3d/book-3d.md) for a dimensional book cover.

## Import
```ts
import { ReflectiveCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sheenColor | `string` | `var(--color-foreground)` | Main metallic sheen color. |
| baseColor | `string` | `var(--color-chart-1)` | Base surface color controlling darker metallic regions. |
| speed | `number` | `6` | Duration of one sheen pass in seconds. |
| roughness | `number` | `0.35` | Surface noise from 0 for mirror-smooth to 1 for heavily frosted. |
| metalness | `number` | `1` | Overall sheen opacity from 0 to 1. |
| className | `string` | - | Class name forwarded to the root. |
| style | `CSSProperties` | - | Inline styles forwarded to the root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Large primary name or card title. |
| subtitle | `ReactNode` | Smaller role or tier below the title. |
| badge | `ReactNode` | Header badge beside the lock icon; `null` removes the entire badge region. |
| footerLabel | `ReactNode` | Small lower-left label such as `"ID NUMBER"`. |
| footerValue | `ReactNode` | Monospaced lower-left value. |
| children | `ReactNode` | Replaces the entire built-in ID layout while retaining the reflective surface and border. |

## Examples

```tsx
<ReflectiveCard />

<ReflectiveCard
  sheenColor="oklch(0.85 0.16 85)"
  baseColor="var(--color-chart-3)"
  title="JANE SMITH"
  subtitle="PLATINUM MEMBER"
  footerLabel="MEMBER NO."
  footerValue="0042-7781-1190"
/>
```

## Usage notes

- The sheen and noise are clearest on a dark stage and become subtle on light backgrounds.
- Passing `children` disables the built-in title, subtitle, badge, and footer slots.
- Use full `--color-` token names such as `var(--color-chart-1)`. [[hulian-token-color-var-needs-color-prefix]] explains why bare `var(--primary)` does not resolve.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
