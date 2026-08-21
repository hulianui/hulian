---
slug: magic-bento
name: MagicBento
category: data-display
group: collection
tags: [animated]
exports: [MagicBento]
status: enriched
---

# MagicBento

> Bento card grid · variable-span cards with pointer-following spotlights, breathing border glow, optional 3D tilt, tokens, and reduced-motion support · data-display/collection · #animated

## When to use

Use MagicBento for a landing-page or dashboard hero containing differently sized feature cards with spotlight and border effects. Use [TiltedCard](../tilted-card/tilted-card.md) for one tilting card, or [PixelCard](../pixel-card/pixel-card.md) for a pixel-wave hover effect.

## Import
```ts
import { MagicBento } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `MagicBentoItem[]` | Built-in examples | Card data; omission renders built-in preview cards. |
| columns | `number` | `4` | Number of grid columns, before item spans are applied. |
| glowColor | `string` | `var(--color-primary)` | Spotlight and border color. Use a real `--color-` token or any CSS color. |
| spotlightRadius | `number` | `280` | Spotlight radius in pixels. |
| enableSpotlight | `boolean` | `true` | Enables the pointer-following radial spotlight. |
| enableBorderGlow | `boolean` | `true` | Brightens borders near the pointer. |
| enableTilt | `boolean` | `false` | Enables subtle 3D pointer tilt. |
| disableAnimations | `boolean` | `false` | Disables all animation and interaction, equivalent to reduced motion. |
| className | `string` | - | Class name forwarded to the grid root. |
| style | `CSSProperties` | - | Inline styles forwarded to the grid root. |

`MagicBentoItem`

| Name | Type | Default | Description |
|------|------|------|------|
| label | `ReactNode` | - | Small card label at the top, such as "Insights". |
| title | `ReactNode` | - | Card title. |
| description | `ReactNode` | - | Card body copy. |
| children | `ReactNode` | - | Replaces the default label, title, and description layout with custom card content. |
| colSpan | `number` | `1` | Grid column span, used to build bento layouts of mixed sizes. |
| rowSpan | `number` | `1` | Grid row span. |

## Examples
```tsx
const items = [
  { label: "Insights", title: "Data insights", description: "Track behavior and funnels", colSpan: 2 },
  { label: "Overview", title: "Overview dashboard", description: "A centralized data view" },
  { label: "Teamwork", title: "Team collaboration", description: "Seamless real-time work" },
];

<MagicBento items={items} />

<MagicBento items={items} glowColor="var(--color-chart-2)" spotlightRadius={420} />
```

## Usage notes

- [[hulian-token-color-var-needs-color-prefix]]: use `var(--color-primary)` or `var(--color-chart-2)`. Bare `var(--primary)` does not resolve under Tailwind v4.
- Keep `colSpan` and `rowSpan` within the configured grid; a span larger than `columns` overflows.
- Reduced motion or `disableAnimations` produces a static grid.
- Built-in descriptions are Chinese: `"\u8ffd\u8e2a\u7528\u6237\u884c\u4e3a"` (“Track user behavior”), `"\u96c6\u4e2d\u5f0f\u6570\u636e\u89c6\u56fe"` (“Centralized data view”), `"\u65e0\u7f1d\u534f\u4f5c"` (“Seamless collaboration”), `"\u7cbe\u7b80\u5de5\u4f5c\u6d41"` (“Streamlined workflows”), `"\u8fde\u63a5\u5e38\u7528\u5de5\u5177"` (“Connect common tools”), and `"\u4f01\u4e1a\u7ea7\u9632\u62a4"` (“Enterprise-grade protection”). Pass `items` for production copy.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
