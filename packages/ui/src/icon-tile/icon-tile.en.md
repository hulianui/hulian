---
slug: icon-tile
name: IconTile
category: data-display
group: info
tags: []
exports: [IconTile, iconTileVariants]
status: enriched
---

# IconTile

> Puts an icon in a small tinted square, placed to the left of feature or notification text. · data-display/info

## When to use

The leftmost cell of "icon + text" rows in feature lists, notification feeds, product-line cards, and settings items. Three sizes, three variants, six semantic tones, and any category color. For a bare icon, use the icon directly; for people or accounts use [Avatar](../avatar/avatar.md); for a brand badge use [Brand](../brand/brand.md).

## Import
```ts
import { IconTile } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"brand" \| "neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"brand"` | Semantic tone, matching Tag and Button |
| variant | `"soft" \| "solid" \| "outline"` | `"soft"` | `soft` is a subtle tinted background with a tinted icon; `solid` is a filled background with a foreground icon; `outline` is a neutral bordered surface where only the icon is tinted |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 32 / 36 / 40px; the corner radius and icon size follow |
| color | `string` | - | Category color: a semantic name (`chart-3` …), any CSS color, or `var(--color-*)`. Overrides `tone`; all three variants derive from it |

> Extends native `<span>` attributes. `aria-hidden` by default (text next to it always explains it); pass `role="img"` and `aria-label` when it has to stand on its own.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | The icon (lucide or another SVG); the component sizes it for each step |

## Examples
```tsx
<div className="flex gap-4">
  <IconTile size="lg"><Plug /></IconTile>
  <div>
    <Text weight="semibold">MCP server</Text>
    <Text size="sm" tone="muted">One command and your assistant looks up props instead of guessing.</Text>
  </div>
</div>

// Selected vs. unselected: filled accent vs. subtle neutral
<IconTile tone={active ? "brand" : "neutral"} variant={active ? "solid" : "soft"}><Component /></IconTile>

// Category colors (a feed colored by event type)
<IconTile variant="solid" color="chart-4"><MessageCircle /></IconTile>
```

## Pitfalls

- The component sizes the icon for each step (`[&>svg]`); don't add `size-*` classes to the icon, or the steps won't line up.
- `aria-hidden` by default: it's decoration and the text next to it carries the meaning. Pass `role="img"` and `aria-label` only when it appears alone and screen readers need to announce it.

## Related
[Avatar](../avatar/avatar.md) · [Brand](../brand/brand.md) · [Tag](../tag/tag.md) · [StatusDot](../status-dot/status-dot.md)
