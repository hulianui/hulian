---
slug: logo-loop
name: LogoLoop
category: data-display
group: collection
tags: [animated]
exports: [LogoLoop]
status: enriched
---

# LogoLoop

> Logo marquee · Seamless RAF-smoothed infinite sequence with four directions, hover pause or speed, item scaling, edge fades, tokens, and reduced-motion support · data-display/collection · #animated

## When to use

Use LogoLoop for an infinitely scrolling row or column of partner, integration, or technology logos. Use [Table](../table/table.md) or [ProTable](../pro-table/pro-table.md) for structured data, or [PricingTable](../pricing-table/pricing-table.md) for a static pricing matrix.

## Import
```ts
import { LogoLoop } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| logos * | `LogoItem[]` | — | Image and node logo entries; the full sequence is duplicated for seamless motion. |
| speed | `number` | `120` | Pixels per second; negative values reverse direction. |
| direction | `"left" \| "right" \| "up" \| "down"` | `"left"` | Scroll direction. |
| width | `number \| string` | `"100%"` | Container width; numbers are pixels and strings pass through. |
| logoHeight | `number` | `28` | Logo height in pixels. |
| gap | `number` | `32` | Gap in pixels. |
| pauseOnHover | `boolean` | `undefined` (equivalent to true) | Stops on hover unless hoverSpeed is also provided. |
| hoverSpeed | `number` | — | Target hover speed, taking precedence over pauseOnHover. |
| fadeOut | `boolean` | `false` | Adds token-aware fades at both ends. |
| fadeOutColor | `string` | `var(--color-surface)` | Fade color. |
| scaleOnHover | `boolean` | `false` | Scales the hovered logo to 1.2. |
| ariaLabel | `string` | `"\u5408\u4f5c\u4f19\u4f34 logo"` | Accessible root label. The built-in Chinese copy means “Partner logos.” |
| className | `string` | — | Root class name. |
| style | `CSSProperties` | — | Root inline styles. |

> LogoItem is either `{ src, srcSet?, sizes?, width?, height?, alt?, title?, href? }` or `{ node, ariaLabel?, title?, href? }`. An entry with href is wrapped in a link.

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem | `(item: LogoItem, index: number) => ReactNode` | Replaces default image or node rendering. |

## Example
```tsx
const logos = [{ node: <HexagonIcon />, ariaLabel: "Hexagon" }, { node: <CloudIcon />, ariaLabel: "Cloud" }];
<LogoLoop logos={logos} fadeOut />
<LogoLoop logos={logos} direction="right" fadeOut pauseOnHover scaleOnHover />
```

## Usage guidelines

- Vertical directions need a parent with explicit height.
- Image alt defaults to an empty string; add meaningful alt text when the logo conveys content.
- hoverSpeed takes precedence when supplied with pauseOnHover.
- Reduced-motion mode stops scrolling.
- Linked items without an explicit item label fall back to the built-in Chinese `"logo \u94fe\u63a5"`, meaning “logo link.”

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
