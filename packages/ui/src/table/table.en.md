---
slug: table
name: Table
category: data-display
group: collection
tags: []
exports: [Table]
status: enriched
---

# Table

> Table · TanStack headless columns with sorting, sizing, alignment, ellipsis, resize, recalculated sticky offsets, row actions and navigation, row drag semantics, and empty states · data-display/collection

## When to use

Use Table for structured two-dimensional records with sorting, selection, trees, or virtualization. Column definitions use TanStack `ColumnDef` directly. Use [ProTable](../pro-table/pro-table.md) for a complete search-toolbar-pagination page, [EditableTable](../editable-table/editable-table.md) for editable cells, or [List](../list/list.md) for a vertical item stream.

## Import
```ts
import { Table } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| columns* | `ColumnDef<TData, any>[]` | — | TanStack column definitions, including accessor, header, cell, and metadata. |
| data* | `TData[]` | — | Row data. |
| enableSorting | `boolean` | `true` | Disables sortable headers, arrows, and `aria-sort` when false. |
| sorting | `SortingState` | — | Controlled sorting; omission uses internal state. |
| striped | `boolean` | `true` | Applies alternating row backgrounds. |
| bordered | `boolean` | `true` | Adds outer border and radius; disable inside ProTable to avoid a double border. |
| density | `"default" \| "middle" \| "compact"` | `"default"` | Cell padding density. |
| getRowId | `(row: TData, index: number) => string` | By index | Stable row key. |
| rowClassName | `(row: TData, index: number) => string \| undefined` | — | Additional row class merged with stripe and selection classes. |
| layout | `"auto" \| "fixed"` | `"auto"` | Auto sizes only explicitly constrained columns; fixed emits every TanStack width and sums table width. |
| resizable | `boolean` | `false` | Enables header-edge resizing and double-click reset, forcing fixed layout. |
| columnSizing | `ColumnSizingState` | — | Controlled column widths by column id. |
| onRowClick | `(row: TData, index: number) => void` | Off | Makes rows pointer- and keyboard-activatable while isolating embedded controls. |
| rowHref | `(row: TData, index: number) => string \| undefined` | Off | Declarative full-page row navigation, with modifier-click opening a new tab. |
| onRowDoubleClick | `(row: TData, index: number) => void` | Off | Independent double-click action with embedded-control isolation. |
| enableRowSelection | `boolean \| ((row: Row<TData>) => boolean)` | Off | Adds a checkbox column and optional per-row eligibility. |
| rowSelection | `RowSelectionState` | — | Controlled selection state. |
| getRowCanExpand | `(row: Row<TData>) => boolean` | — | Limits expandable rows. |
| getSubRows | `(row: TData) => TData[] \| undefined` | — | Enables a tree with indentation by depth. |
| indent | `number` | `16` | Tree and detail indentation per level in pixels. |
| expanded | `ExpandedState` | — | Controlled state shared by tree and detail expansion. |
| columnFilters | `ColumnFiltersState` | — | Controlled column filters. |
| rowDraggable | `boolean` | `false` | Enables dnd-kit row sorting; data remains controlled and the result is returned by `onRowDragEnd`. |
| dragHandle | `"row" \| "cell"` | `"cell"` | Uses the entire row or a prepended handle cell. |
| getRowCanDrag | `(row: TData, index: number) => boolean` | All rows | Disables dragging and drop targeting per row; nested rows are always disabled. |
| virtual | `VirtualOptions` | Off | Optional virtualization: `{ enabled; rowHeight?=44; height?=480; overscan?=8 }`. |
| stickyScrollbar | `boolean` | `false` | Floating horizontal scrollbar. When a wide table is taller than the viewport, a proxy scrollbar stays pinned to the bottom of the viewport so the table can be scrolled sideways without first scrolling to its last row. It appears only while the content actually overflows and the bottom edge of the table is below the fold, and it hides again once the real scrollbar comes into view. Works alongside pinned columns; **it has no effect when `virtual` is enabled**, because that container has a fixed height and always shows its own scrollbar. ⚠️ Enabling it wraps the table in one extra `div`, because a `position: sticky` proxy has to be a sibling of the scroll container. `className` still lands on the inner scroll container, so in a flex or grid parent the wrapper is the item, not the container. |
| className | `string` | — | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onSortingChange | `OnChangeFn<SortingState>` | Sorting change. |
| onRowSelectionChange | `OnChangeFn<RowSelectionState>` | Selection change. |
| onExpandedChange | `OnChangeFn<ExpandedState>` | Tree or detail expansion change. |
| onColumnFiltersChange | `OnChangeFn<ColumnFiltersState>` | Column-filter change. |
| onColumnSizingChange | `OnChangeFn<ColumnSizingState>` | Column widths, updated continuously during resize. |
| onRowDragEnd | `(e: RowDragEndEvent<TData>) => void` | Valid changed drop result with ids, indices, `position: "before" \| "after"`, rows, and `nextData`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderExpandedRow | `(row: Row<TData>) => ReactNode` | Adds an expander and renders a full-width detail panel. |
| emptyText | `ReactNode` | Empty-state copy, defaulting to `locale.table.empty`. |
| renderEmpty | `() => ReactNode` | Fully custom empty state, taking precedence over `emptyText`. |

Additional `ColumnDef.meta` fields:

| meta | Type | Description | Element Plus equivalent |
|------|------|------|------|
| sticky | `"left" \| "right"` | Pins a column and computes its offset. | `fixed` |
| filterable | `boolean` | Renders a built-in text filter in the header. | — |
| align | `"left" \| "center" \| "right"` | Horizontal cell alignment. | `align` |
| headerAlign | `"left" \| "center" \| "right"` | Header alignment, otherwise following `align`. | `header-align` |
| ellipsis | `boolean` | Truncates overflow and shows the full raw value in a tooltip. | `show-overflow-tooltip` |

Column geometry uses TanStack `ColumnDef.size`, `minSize`, and `maxSize` directly. Headers and cells receive matching inline width styles without a `<colgroup>`.

## Examples
```tsx
const columns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

<Table columns={columns} data={users} />
<Table columns={columns} data={users} enableRowSelection />
<Table columns={columns} data={users} onRowClick={(row) => router.push(`/users/${row.id}`)} />
<Table columns={columns} data={users} rowHref={(row) => `/users/${row.id}`} />

const geoColumns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "Name", size: 120 },
  { accessorKey: "email", header: "Email", size: 180, meta: { ellipsis: true } },
  { accessorKey: "role", header: "Role", size: 100, meta: { align: "center" } },
  { accessorKey: "id", header: "ID", minSize: 120, meta: { align: "right", headerAlign: "right" } },
];
<Table columns={geoColumns} data={users} />
<Table columns={geoColumns} data={users} resizable columnSizing={sizing} onColumnSizingChange={setSizing} />

<Table
  columns={columns}
  data={rows}
  getRowId={(r) => r.id}
  enableSorting={false}
  rowDraggable
  onRowDragEnd={(e) => {
    setRows(e.nextData);
    api.sortable({
      move: e.activeId,
      target: e.overId,
      order: filter.order,
      direction: e.position === "after" ? "down" : "up",
    });
  }}
/>
```

## Usage notes

- Width styles are emitted only for explicit `size`, `minSize`, or `maxSize`; this avoids TanStack's default size turning every auto-layout column into equal 150 px widths.
- Ellipsis needs a definite `size`, `maxSize`, or fixed layout. Its tooltip uses the raw string or number, not arbitrary custom-cell content.
- Sticky offsets sum `getSize()`, so pinned columns are forced to that width; set `size` explicitly and ensure content is wide enough to scroll.
- Resizing forces fixed layout. If summed widths are narrower than the container, `min-w-full` lets the browser stretch them and no horizontal scroll occurs.
- Virtualization requires optional `@tanstack/react-virtual` and is best for flat data, not trees, details, or drag-and-drop.
- Disable `bordered` when Table sits inside another bordered card.
- Sorting, selection, expansion, and filtering are internal unless the corresponding state and change handler are both supplied.
- `rowHref` uses `window.location.assign`; use `onRowClick` with `router.push` for SPA navigation. `onRowClick` takes precedence when both exist.
- A browser double-click emits two clicks first, so keep `onRowClick` reentrant when also using `onRowDoubleClick`.
- Embedded interactions are isolated by semantic selectors. Give custom clickable elements an appropriate role.
- Dragging never mutates `data`; write `e.nextData` or a server result back or the row snaps to its old place.
- Do not combine drag order with active column sorting; filtered drag also expresses order only among visible rows.
- Without `getRowId`, drag ids are array indices and cannot safely identify backend records.
- With `dragHandle="row"`, Space belongs to dnd-kit and Enter activates the row; use the default cell handle to avoid conflict.
- Virtual rows outside the viewport are not drop targets and drag does not auto-page.
- Only top-level tree rows are draggable. Use [Tree](../tree/tree.md) for hierarchical node movement.
- Current built-in Chinese control labels are `"\u62d6\u62fd\u6392\u5e8f"` (“Drag to reorder”), `"\u5168\u9009"` (“Select all”), `"\u9009\u62e9\u884c"` (“Select row”), `"\u6536\u8d77"` / `"\u5c55\u5f00"` (“Collapse” / “Expand”), `"\u7b5b\u9009\u2026"` (“Filter…”), dynamic `"\u7b5b\u9009 <column>"` (“Filter <column>”), and `"\u8c03\u6574\u5217\u5bbd"` (“Resize column”). `emptyText` also inherits the active locale.

## Related
[Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
