---
slug: magic-card
name: MagicCard
category: data-display
group: collection
tags: [animated]
exports: [MagicCard]
status: enriched
---

# MagicCard

> Magic card · pointer-following radial highlight powered by Motion and surface tokens · data-display/collection · #animated

## When to use

Use MagicCard to add a subtle pointer-following highlight to one landing-page or feature card. Use [BentoGrid](../bento-grid/bento-grid.md) for a varied feature grid, or a plain Card when interaction is unnecessary.

## Import
```ts
import { MagicCard } from "@hulianui/ui"
```

## Props

Inherits `ComponentPropsWithoutRef<"div">`.

| Name | Type | Default | Description |
|------|------|------|------|
| gradientSize | number | 200 | Highlight radius in pixels. |
| gradientColor | string | `var(--color-primary)` | Highlight color. |
| gradientOpacity | number | 0.15 | Highlight opacity. |
| ...div | ComponentPropsWithoutRef\<"div"\> | - | Forwarded props; `className` controls size. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | ReactNode | Card content. |

## Example
```tsx
<MagicCard className="h-44 w-72">
  <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
    <span className="text-lg font-semibold text-foreground">Magic Card</span>
    <span className="text-sm text-muted-foreground">Move the pointer to reveal the glow</span>
  </div>
</MagicCard>
```

## Usage notes

- Pointer movement makes this a client component. The effect is progressive enhancement and does not trigger on touch-only devices.
- Use full token names such as `var(--color-primary)` for `gradientColor`; see [[hulian-token-color-var-needs-color-prefix]].

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
