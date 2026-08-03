---
slug: pixel-card
name: PixelCard
category: data-display
group: collection
tags: [animated]
exports: [PixelCard]
status: enriched
---

# PixelCard

> Pixel card · Canvas 2D pixels grow and flicker outward in a wave on hover or focus, then contract, with four variants, token colors, RAF, and reduced-motion support · data-display/collection · #animated

## When to use

Use PixelCard as a retro or technical animated background for card content. Use [TiltedCard](../tilted-card/tilted-card.md) for pointer-driven 3D tilt, or [MagicBento](../magic-bento/magic-bento.md) for a spotlight grid.

## Import
```ts
import { PixelCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"default" \| "blue" \| "pink" \| "amber"` | `"default"` | Preset controlling gap, speed, colors, and focus behavior; explicit props override the preset. |
| gap | `number` | Variant default | Pixel spacing in pixels. Smaller values are denser and more expensive; 3 to 12 is recommended. |
| speed | `number` | Variant default | Animation speed from 0 to 100; zero disables animation. |
| colors | `string[]` | Variant token colors | Colors sampled by pixels. Accepts CSS colors and real Hulian tokens. |
| noFocus | `boolean` | Variant default | If true, only pointer hover triggers and the root is not keyboard-focusable. |
| className | `string` | — | Root classes controlling size, radius, and border. |
| style | `CSSProperties` | — | Inline styles forwarded to the root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content layered above the canvas. |

## Examples
```tsx
<PixelCard variant="blue" className="h-48 w-64">
  <div className="flex flex-col items-center gap-1 px-6 text-center">
    <p className="text-base font-semibold text-foreground">Pixel Card</p>
    <p className="text-xs text-muted">Hover or focus to animate</p>
  </div>
</PixelCard>

<PixelCard colors={["var(--color-chart-5)", "var(--color-chart-1)"]} gap={5} speed={18} className="h-48 w-64" />
```

## Usage notes

- Set dimensions through `className` or `style`; a zero-sized host produces an invisible canvas.
- Smaller `gap` values increase the number of pixels and RAF redraw cost.
- [[hulian-token-color-var-needs-color-prefix]]: use `var(--color-chart-2)`, not bare `var(--chart-2)`, for canvas colors.
- Reduced motion and `speed=0` disable the wave animation.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
