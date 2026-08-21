---
slug: chroma-grid
name: ChromaGrid
category: data-display
group: collection
tags: [animated]
exports: [ChromaGrid]
status: enriched
---

# ChromaGrid

> Spotlight card wall · Grayscale field revealing full color around a spring-smoothed pointer, plus per-card radial highlights and reduced-motion support · data-display/collection · #animated

## When to use

Use ChromaGrid for a team, member, or portfolio wall that is muted in grayscale until a pointer spotlight reveals full color. Use [CardSwap](../card-swap/card-swap.md) for a cycling 3D stack, [BounceCards](../bounce-cards/bounce-cards.md) for a fanned entrance, or [Table](../table/table.md) for structured data. Customize item color with borderColor and gradient chart tokens.

## Import
```ts
import { ChromaGrid } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `ChromaGridItem[]` | Built-in placeholders | Cards; omission uses six built-in Chinese sample profiles for preview. |
| radius | `number` | `300` | Full-color reveal radius in pixels. |
| columns | `number` | `3` | Desktop columns, falling back to one on narrow screens. |
| damping | `number` | `0.45` | Pointer damping from 0 to 1; larger follows more slowly. |
| fadeOut | `number` | `0.6` | Seconds for grayscale to return after pointer exit. |
| className | `string` | - | Root class name. |
| style | `CSSProperties` | - | Root inline styles. |

`ChromaGridItem`

| Name | Type | Default | Description |
|------|------|------|------|
| image | `string` | - | Card header image (portrait or cover). Without it only the text area renders. |
| title | `string` | - | Primary title such as a person or product name. |
| subtitle | `string` | - | Secondary line such as a role or description. |
| handle | `string` | - | Handle such as `@name`, rendered on the left of the subtitle row. |
| location | `string` | - | Extra line such as a location, rendered on the right of the subtitle row. |
| borderColor | `string` | - | Card outline color, which lights up on hover. `var(--color-chart-1)` through `var(--color-chart-5)` are recommended. |
| gradient | `string` | - | Card background gradient such as `linear-gradient(145deg, var(--color-chart-1), transparent)`. The card face is a **dark context**: a neutral dark base always sits below this gradient, so the `transparent` end reveals that base rather than the page background, and light themes never end up with white text on a pale surface (#129). |
| url | `string` | - | Click destination. When present the card is clickable and opens in a new tab; otherwise the cursor stays default. |
| children | `ReactNode` | - | Replaces the default image-plus-text layout. |

## Example
```tsx
<ChromaGrid columns={2} radius={260} items={[
  { title: "Lin Yu", subtitle: "Full-stack engineer", handle: "@linyu", borderColor: "var(--color-chart-1)", gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)" },
  { title: "Chen Mo", subtitle: "DevOps engineer", handle: "@chenmo", borderColor: "var(--color-chart-2)", gradient: "linear-gradient(210deg, var(--color-chart-2), transparent)" },
]} />
```

Built-in preview:
```tsx
<ChromaGrid columns={3} />
```

## Usage guidelines

- Use the `--color-` prefix for chart tokens; bare chart variables do not resolve reliably in gradients and borders.
- Grayscale contrast looks best on a dark container.
- **Cards are a dark context.** The card face comes from the consumer's `gradient`, so text that followed the page theme would give the component no way to guarantee any contrast: a different gradient would mean a different readability. Titles, handles, and subtitles therefore use fixed white steps, and the component always paints a neutral dark base **underneath** your gradient, so a `transparent` stop reveals that dark base rather than the page background. If you want light card faces, this is the wrong component. Use [Masonry](../masonry/masonry.md) or a plain card wall.
- **No grayscale dimming without a pointer.** Both reveal overlays are disabled under `@media (hover: none)`. Without a cursor there is never a "lit" card, so touch, keyboard-only, screenshot, and print users would see every card permanently degraded, and the names and roles on a card are content, not decoration.
- Reduced motion changes spring following to direct positioning.
- The six built-in sample title and role pairs are `"\u6797\u5c7f"` / `"\u5168\u6808\u5de5\u7a0b\u5e08"` (“Lin Yu” / “Full-stack engineer”), `"\u9648\u58a8"` / `"DevOps \u5de5\u7a0b\u5e08"` (“Chen Mo” / “DevOps engineer”), `"\u82cf\u9ece"` / `"UI/UX \u8bbe\u8ba1\u5e08"` (“Su Li” / “UI/UX designer”), `"\u5468\u91ce"` / `"\u6570\u636e\u79d1\u5b66\u5bb6"` (“Zhou Ye” / “Data scientist”), `"\u91d1\u6eaa"` / `"\u79fb\u52a8\u7aef\u5f00\u53d1"` (“Jin Xi” / “Mobile developer”), and `"\u5510\u884d"` / `"\u4e91\u67b6\u6784\u5e08"` (“Tang Yan” / “Cloud architect”). Pass `items` for production content.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
