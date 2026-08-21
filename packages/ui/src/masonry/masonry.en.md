---
slug: masonry
name: Masonry
category: layout
group: container
tags: []
exports: [Masonry]
status: enriched
---

# Masonry

> Distributes items deterministically across responsive columns without hydration-order changes. · layout/container

## When to use

Use Masonry to arrange unequal-height cards (photos, activity items, generated assets) into staggered columns while preserving SSR safety and source order. It distributes items deterministically rather than using native CSS columns, avoiding hydration mismatches and visual reordering. Use [AspectRatio](../aspect-ratio/aspect-ratio.md) for one fixed-ratio item, or CSS Grid for a regular equal-height layout.

## Import
```ts
import { Masonry } from "@hulianui/ui"
```

## Props

`Masonry<T>` generic component.

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `T[]` | - | Source items, distributed round-robin in source order. |
| columns | `number \| { base?: number; sm?: number; md?: number; lg?: number }` | `3` | Fixed count when numeric, or responsive counts by breakpoint. `base` is used for SSR and the first client frame; `matchMedia` selects a breakpoint after mount. |
| gap | `number` | `16` | Gap between columns and between items within each column (px). |
| className | `string` | - | The root container class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem* | `(item: T, index: number) => ReactNode` | Renders one item; the returned node is wrapped in a column cell. |

## Example
```tsx
// Fixed 3 columns
<Masonry items={tiles} columns={3} gap={16} renderItem={(t) => <Tile tile={t} />} />
```

```tsx
// Responsive columns; base is used during SSR and on the first client frame
<Masonry
  items={photos}
  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
  gap={16}
  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}
/>
```

## Usage guidelines

- **Responsive columns use `base` for SSR and the first client frame.** After mounting, `matchMedia` switches to the current breakpoint count. This intentionally prevents hydration mismatches, so a wide viewport may briefly begin with the `base` count.
- **Round-robin does not fill the shortest column.** The deterministic rule is `item[i] → column i % count`, which preserves order and SSR output but can leave column heights uneven. Do not use Masonry when exact shortest-column packing is required.
- The `sm`, `md`, and `lg` breakpoints are 640, 768, and 1024 px, matching Tailwind defaults. The largest matching breakpoint wins; otherwise the component falls back to `base`.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
