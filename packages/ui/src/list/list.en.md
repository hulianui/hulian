---
slug: list
name: List
category: data-display
group: collection
tags: []
exports: [List, ListItem, ListItemMeta]
status: enriched
---

# List

> Presents accessible named lists with structured items, metadata, actions, grid mode, empty states, and pagination or load-more controls. · data-display/collection

## When to use

Use List for homogeneous member, message, setting, or resource entries. Use [Table](../table/table.md) or [EditableTable](../editable-table/editable-table.md) when headers, sorting, or editable columns matter. List is the lighter avatar-title-description-action pattern and can become a card grid.

## Import
```ts
import { List, ListItem, ListItemMeta } from "@hulianui/ui"
```

## Props

`ListProps<T>`:

| Name | Type | Default | Description |
|------|------|------|------|
| items | `T[]` | - | Data-driven entries used with `renderItem`. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Row padding density. |
| bordered | `boolean` | `false` | Adds an outer border and radius; ignored in grid mode. |
| inset | `boolean` | Follows `bordered` | Horizontal padding for rows, header, and footer. |
| split | `boolean` | `true` | Row separators; ignored in grid mode. |
| grid | `boolean \| ListGridConfig` | - | Card-grid mode; true uses three columns. |
| loadMore | `ListLoadMore` | - | Bottom load-more action and loading state. |

`ListItemProps` (the `<ListItem>` used in the compound form)

| Name | Type | Default | Description |
|------|------|------|------|
| actions | `ReactNode[]` | - | Action area on the right of the row; separators are inserted between entries automatically. |

`ListItemMetaProps` (`<ListItemMeta>`, the avatar / title / description trio on the left)

| Name | Type | Default | Description |
|------|------|------|------|
| avatar | `ReactNode` | - | Avatar or icon (reuses Avatar). |
| title | `ReactNode` | - | Title. |
| description | `ReactNode` | - | Description. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem | `(item: T, index: number) => ReactNode` | Renders each data item, usually as `ListItem`; omission treats the item as a React node. |
| children | `ReactNode` | Composed `ListItem` children, used only when `items` is absent. |
| header | `ReactNode` | Header content. |
| footer | `ReactNode` | Content at the very bottom. |
| empty | `ReactNode` | Empty state; omission uses built-in `Empty`. |
| pagination | `ReactNode` | Pagination content below the list. |

`ListGridConfig` has `cols` (default 3), `gap` (default 4, multiplied by 0.25rem), `colGap`, `rowGap`, and `rows`. `ListLoadMore` has `onLoadMore*`, `loading`, `hasMore` (default true), and `text`; its built-in Chinese text is `"\u52a0\u8f7d\u66f4\u591a"`, meaning “Load more.”

`ListItemProps` has `actions?: ReactNode[]` and `children`. `ListItemMetaProps` has `avatar`, `title`, and `description`.

## Examples
```tsx
<List
  bordered
  items={people}
  renderItem={(p) => (
    <ListItem actions={[<Button key="e" variant="ghost" size="sm">Edit</Button>]}>
      <ListItem.Meta avatar={<Avatar fallback={p.initials} />} title={p.name} description={p.role} />
    </ListItem>
  )}
  header={<span>Team members</span>}
/>

<List grid={{ cols: 2, gap: 4 }} items={people}
  renderItem={(p) => <ListItem>…</ListItem>} />
```

## Usage notes

- `items` takes precedence over `children`. Use `items + renderItem` for data and children for static composition.
- Grid mode ignores `bordered` and `split`; each card should own its border.
- When `loadMore.hasMore` is false, the load-more action is not rendered.
- The built-in empty title is `"\u6682\u65e0\u6570\u636e"`, meaning “No data.”

### Accessible name

`aria-label`, `aria-labelledby`, and `aria-describedby` are forwarded to the node with `role="list"`; other native attributes remain on the outer container. This makes `getByRole("list", { name: "…" })` work and prevents assistive technology from encountering an unnamed list (hulianui/hulian#60).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
