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

// Composition primitives, for tables whose structure you write yourself
import {
  TableRoot, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell,
} from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| columns* | `ColumnDef<TData, any>[]` | - | TanStack column definitions, including accessor, header, cell, and metadata. |
| data* | `TData[]` | - | Row data. |
| enableSorting | `boolean` | `true` | Disables sortable headers, arrows, and `aria-sort` when false. |
| sorting | `SortingState` | - | Controlled sorting; omission uses internal state. |
| striped | `boolean` | `true` | Applies alternating row backgrounds. |
| bordered | `boolean` | `true` | Adds outer border and radius; disable inside ProTable to avoid a double border. |
| density | `"default" \| "middle" \| "compact"` | `"default"` | Cell padding density. |
| getRowId | `(row: TData, index: number) => string` | By index | Stable row key. |
| rowClassName | `(row: TData, index: number) => string \| undefined` | - | Additional row class merged with stripe and selection classes. |
| cellClassName | `(ctx) => string \| undefined` | - | Additional **cell** class landing on the `<td>` itself, the equivalent of the el-table `cell-class-name` and the antd `column.onCell`. `ctx` is `{ row, rowIndex, rows, columnId, columnIndex, value }`, the same shape as `cellSpan`. Use it to colour cells by value, where one column paints a different background per row. Wrapping a coloured box inside `ColumnDef.cell` cannot do this: the cell padding still shows the stripe or pinned-column background underneath. Merged with the existing cell classes, never replacing them. |
| layout | `"auto" \| "fixed"` | `"auto"` | Auto sizes only explicitly constrained columns; fixed emits every TanStack width and sums table width. |
| resizable | `boolean` | `false` | Enables header-edge resizing and double-click reset, forcing fixed layout. |
| columnSizing | `ColumnSizingState` | - | Controlled column widths by column id. |
| onRowClick | `(row: TData, index: number) => void` | Off | Makes rows pointer- and keyboard-activatable while isolating embedded controls. |
| rowHref | `(row: TData, index: number) => string \| undefined` | Off | Declarative full-page row navigation, with modifier-click opening a new tab. |
| onRowDoubleClick | `(row: TData, index: number) => void` | Off | Independent double-click action with embedded-control isolation. |
| enableRowSelection | `boolean \| ((row: Row<TData>) => boolean)` | Off | Adds a checkbox column and optional per-row eligibility. |
| rowSelection | `RowSelectionState` | - | Controlled selection state. |
| getRowCanExpand | `(row: Row<TData>) => boolean` | - | Limits expandable rows. |
| getSubRows | `(row: TData) => TData[] \| undefined` | - | Enables a tree with indentation by depth. |
| indent | `number` | `16` | Tree and detail indentation per level in pixels. |
| expanded | `ExpandedState` | - | Controlled state shared by tree and detail expansion. |
| columnFilters | `ColumnFiltersState` | - | Controlled column filters. |
| filterPlacement | `"header" \| "row"` | `"header"` | Where filter controls live. `header` keeps them inside the header cell, next to the column name and the sort button; `row` moves them to a dedicated `<tr>` below the header row, so the header keeps its single-row height and the controls line up with the leaf columns even under grouped headers. The row is not rendered when no column is filterable. |
| rowDraggable | `boolean` | `false` | Enables dnd-kit row sorting; data remains controlled and the result is returned by `onRowDragEnd`. |
| dragHandle | `"row" \| "cell"` | `"cell"` | Uses the entire row or a prepended handle cell. |
| getRowCanDrag | `(row: TData, index: number) => boolean` | All rows | Disables dragging and drop targeting per row; nested rows are always disabled. |
| cellSpan | `(ctx) => { rowSpan?, colSpan? } \| void` | - | Cell merging, the equivalent of the el-table `:span-method`. The callback runs per cell and is **not called for cells covered by an earlier span**. `ctx` is `{ row, rowIndex, rows, columnId, columnIndex, value }`, where `rowIndex` follows render order (after sorting and filtering) and `rows` is ordered the same way. It cannot be combined with `virtual` or `renderExpandedRow`; those combinations skip merging and warn in development. |
| stickyHeader | `boolean \| "self" \| "scrollParent"` | `false` | Pins the header row, independently of `virtual`. `true` / `"self"` pins it against **the table's own scroll area** and therefore **requires `maxHeight`**: without a height constraint the shell never scrolls, so a sticky header has no scrolling ancestor to anchor to, and the component warns in development. `"scrollParent"` pins it against **an outer scroll container** (the page or a layout content area); the table itself no longer scrolls, and the shell consequently **loses `overflow-x-auto`** (see Usage notes). |
| stickyHeaderOffset | `number \| string` | `0` | Offset of the pinned header (numbers are pixels), emitted as the `top` of `<thead>`, so it can clear a fixed page header: `stickyHeaderOffset={56}`. Applies to both modes. |
| maxHeight | `number \| string` | - | Maximum height of the scroll area (numbers are pixels). It is what makes the shell scroll vertically; when `virtual` is enabled, `virtual.height` wins. |
| minWidth | `number \| string` | - | Minimum width of the `<table>` element itself. A `min-w-*` class in `className` pins the scroll shell instead, which stops the horizontal scrollbar from ever appearing and leaves off-screen columns clipped and unreachable. |
| cellAlign | `"left" \| "center" \| "right"` | - | **Table-level default** for horizontal cell alignment (#292); `meta.align` overrides it per column. Unset keeps the historical default (left). Alignment is a whole-table decision: per-column `meta.align` cannot express "this table is centered", and the column you forget is the visual crack. |
| headerAlign | `"left" \| "center" \| "right"` | - | **Table-level default** for header alignment (#292); unset follows `cellAlign`, while `meta.headerAlign` / `meta.align` still win per column. Setting it explicitly also overrides the "group headers are always centered" fallback for columns spanning several leaves. |
| cellVerticalAlign | `"top" \| "middle" \| "bottom"` | `"middle"` | Table-level default for cell vertical alignment; `meta.verticalAlign` overrides it per column. |
| cellWhitespace | `"nowrap" \| "normal" \| "pre-wrap"` | - | Table-level default wrapping strategy; `meta.whitespace` overrides it per column. The usual shape is table-level `nowrap` plus a few `normal` columns. |
| virtual | `VirtualOptions` | Off | Optional virtualization: `{ enabled; rowHeight?=44; height?=480; overscan?=8 }`. |
| stickyScrollbar | `boolean` | `false` | Floating horizontal scrollbar. When a wide table is taller than the viewport, a proxy scrollbar stays pinned to the bottom of the viewport so the table can be scrolled sideways without first scrolling to its last row. It appears only while the content actually overflows and the bottom edge of the table is below the fold, and it hides again once the real scrollbar comes into view. Works alongside pinned columns; **it has no effect when `virtual` or `maxHeight` is set**, because the shell is then a fixed-height scroll container that already shows its own horizontal scrollbar. ⚠️ Enabling it wraps the table in one extra `div`, because a `position: sticky` proxy has to be a sibling of the scroll container. `className` still lands on the inner scroll container, so in a flex or grid parent the wrapper is the item, not the container. |
| className | `string` | - | Root class name. |

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
| renderRowExtra | `(row: Row<TData>, ctx: { colSpan, rowIndex }) => ReactNode` | Attaches 0..N persistent rows **after** each data row. It returns **bare `<tr>` elements** (an array, a fragment, or `null`); the component does not wrap them, so a full-width row is written as `<tr><td colSpan={ctx.colSpan}>`. No expander column is added and no expanded state is required. Cannot be combined with `cellSpan`. |
| footer | `ReactNode \| ((ctx: { rows, colSpan }) => ReactNode)` | Content of the `<tfoot>` element, for totals or a persistent "add a row" affordance. It follows the `EditableTable.summary` contract: **you supply `<tr><td colSpan=...>` yourself**, and `ctx.rows` holds the visible rows after sorting and filtering. Unlike `summary`, it **also renders for an empty table**. |
| emptyText | `ReactNode` | Empty-state copy, defaulting to `locale.table.empty`. |
| renderEmpty | `() => ReactNode` | Fully custom empty state, taking precedence over `emptyText`. |

Additional `ColumnDef.meta` fields:

| meta | Type | Description | Element Plus equivalent |
|------|------|------|------|
| sticky | `"left" \| "right"` | Pins a column and computes its offset. | `fixed` |
| filterable | `boolean` | Renders a built-in text filter in the header. | - |
| filterRender | `(ctx) => ReactNode` | Replaces the filter control for this column, so enum columns get a select, date columns get a date control and numeric columns get a range. `ctx` is `{ value, setValue, column }`; call `setValue(undefined)` to clear this column's filter. **Setting it already makes the column filterable**, so `filterable` is not needed as well. The accessible name of your control is yours to provide. | `filters` or a custom header (antd calls this `filterDropdown`) |
| align | `"left" \| "center" \| "right"` | Horizontal cell alignment. | `align` |
| headerAlign | `"left" \| "center" \| "right"` | Header alignment, otherwise following `align`. | `header-align` |
| ellipsis | `boolean` | Truncates overflow and shows the full raw value in a tooltip. | `show-overflow-tooltip` |
| verticalAlign | `"top" \| "middle" \| "bottom"` | Vertical alignment of the cell; header cells stay `middle`. A column that wraps almost always wants `top`. | - |
| whitespace | `"nowrap" \| "normal" \| "pre-wrap"` | Wrapping strategy. `pre-wrap` keeps the author's line breaks and spaces and adds `break-words`. Mutually exclusive with `ellipsis`, which requires a single line. | - |
| lockVisible | `boolean` | Locks visibility: the column cannot be switched off from the [ProTable](../pro-table/pro-table.md) column-setting popover (its checkbox is checked and disabled), and a controlled `columnVisibility` entry of `false` does not apply to it either. Identity and action columns are the typical case. | - |

Column geometry uses TanStack `ColumnDef.size`, `minSize`, and `maxSize` directly. Headers and cells receive matching inline width styles without a `<colgroup>`.

## Composition primitives

`TableRoot / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell` are seven thin
wrappers for tables whose structure is written by product code and only need the library skin. The
criterion is not that Table is too weak, it is that **configuration cannot express structure**: two
nested levels inside one row, a row that is entirely an editor, one record split into three rows.
Expressed as `ColumnDef[]` those become readable table structure translated into `cell` callbacks,
which only reads worse. So both routes coexist: data-driven tables that need sorting, pagination, or
pinned columns use the high-level `Table`, everything else uses the primitives. The skin (density
steps, separators, hover, selected background) comes from the same source as the high-level `Table`,
so this is not a second look-alike system.

### TableRoot

| Name | Type | Default | Description |
|------|------|------|------|
| density | `"default" \| "middle" \| "compact"` | `"default"` | Cell padding density, passed down to `TableHead` and `TableCell` through context. |
| striped | `boolean` | `false` | Alternating backgrounds on `TableBody` rows only. The default is **the opposite** of the high-level `Table`: hand-written structures often contain full-width attached rows or merged cells, so "every other `<tr>`" no longer matches "every other record". |
| bordered | `boolean` | `true` | Outer border and radius; disable it inside a card to avoid a double border. |
| layout | `"auto" \| "fixed"` | `"auto"` | `table-layout`. |
| minWidth | `number \| string` | - | Minimum width of the `<table>` element itself. `className` lands on the scroll shell, where `min-w-*` would stop the horizontal scrollbar from ever appearing. |
| tableClassName | `string` | - | Class name for the `<table>` element. |
| cellWhitespace | `"nowrap" \| "normal" \| "pre-wrap"` | - | Table-level wrapping policy (#285), passed down to `TableCell` through context; same name and meaning as `cellWhitespace` on the high-level `Table`. Unset means the browser default (wrap). The typical shape is "table-level `nowrap` plus a few `TableCell whitespace="normal"`"; `TableHead` is unaffected and never wraps. |
| cellAlign | `"left" \| "center" \| "right"` | - | Table-level horizontal cell alignment (#292), passed down to `TableCell` through context; same name and meaning as `cellAlign` on the high-level `Table`. Unset means `left`; a per-cell `TableCell align` still wins. |
| headerAlign | `"left" \| "center" \| "right"` | - | Table-level header alignment (#292), passed down to `TableHead`; unset follows `cellAlign`, and a per-cell `TableHead align` still wins. |
| ref | `Ref<HTMLDivElement>` | - | The **outer scroll container** (the `overflow-x-auto` layer). Horizontal scroll state exists only there. |

`TableHeader`, `TableBody`, and `TableFooter` accept the native `<thead>`, `<tbody>`, and `<tfoot>` attributes, plus a `ref`.

All seven primitives **take a `ref`**, each landing on its own DOM node (`TableRoot` on the scrolling `div`, the rest on `thead` / `tbody` / `tfoot` / `tr` / `th` / `td`). `TableRoot` matters most: horizontal scroll state lives only on that `overflow-x-auto` `div`, so a hand-drawn floating horizontal scrollbar, a `ResizeObserver` on the container width, "scroll to column N", and two tables scrolling in sync all need it.

```tsx
const scroller = useRef<HTMLDivElement>(null)
// scrollLeft / scrollWidth / clientWidth all live on this layer
<TableRoot ref={scroller}>…</TableRoot>
```

### TableRow / TableHead / TableCell

| Name | Type | Default | Description |
|------|------|------|------|
| selected | `boolean` | `false` | `TableRow`: selected state (accent background plus `data-selected`, the same skin as a selected row in the high-level `Table`). |
| align | `"left" \| "center" \| "right"` | `"left"` | `TableHead` and `TableCell`: horizontal alignment, applied as a class rather than the deprecated HTML `align` attribute. Unset follows `TableRoot`'s `headerAlign` / `cellAlign` (#292). |
| verticalAlign | `"top" \| "middle" \| "bottom"` | `"middle"` | `TableCell`: vertical alignment. |
| whitespace | `"nowrap" \| "normal" \| "pre-wrap"` | - | `TableCell`: per-cell wrapping policy (#285) that overrides `TableRoot`'s `cellWhitespace`; same as the column-level `meta.whitespace` on the high-level `Table`. `pre-wrap` / `normal` also apply `break-words`. |
| width | `number \| string` | - | `TableHead` / `TableCell`: width, applied as `style.width` (numbers are px, strings are passed through) (#286). Use it when the column width is **data** (field configuration, user-editable) instead of writing `style` in product code. `@hulianui/guard`'s no-style-override rejects that, dynamic `w-[${px}px]` classes are never compiled by Tailwind, and `<col>` is only reliable under `layout="fixed"` and cannot express `maxWidth`. |
| minWidth | `number \| string` | - | `TableHead` / `TableCell`: lower bound, applied as `style.minWidth`. |
| maxWidth | `number \| string` | - | `TableHead` / `TableCell`: upper bound, applied as `style.maxWidth`. `truncate` needs it to cap the column; otherwise auto layout lets content widen the column and the ellipsis never appears. The three mirror `size` / `minSize` / `maxSize` on the high-level `Table`; an explicit `style` on the element still passes through and wins. |
| ref | `Ref<HTMLTableRowElement \| HTMLTableCellElement>` | - | Lands on the `tr` / `th` / `td` itself ("scroll to this row", "measure this cell"). |

`TableRow` derives its separator, hover, and stripe treatment from the section it sits in. Header rows
do not hover, do not stripe, and do not take `last:border-0`, because a single header row is also the last
row, and that rule would erase the bottom border of the header. Product code never has to remember
this difference.

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

// Colour a cell by its value; the background lands on the <td> itself, so it is
// not layered on top of the stripe or pinned-column colour.
<Table
  columns={columns}
  data={users}
  cellClassName={({ columnId, value }) =>
    columnId === "status" && value === "overdue" ? "bg-danger/10 text-danger" : undefined
  }
/>

// Per-column filter controls, moved to a dedicated row below the header.
const filterColumns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "Name", meta: { filterable: true } }, // built-in text box
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      // filterRender alone already makes the column filterable
      filterRender: ({ value, setValue }) => (
        <RoleSelect
          value={(value as string) ?? ""}
          onChange={(v) => setValue(v || undefined)} // undefined clears this column's filter
        />
      ),
    },
  },
];
<Table columns={filterColumns} data={users} filterPlacement="row" />

<Table
  columns={columns}
  data={periods}
  renderRowExtra={(row, ctx) =>
    row.original.titles.map((t) => (
      <tr key={t.id} className="bg-surface-hover/30">
        <td colSpan={ctx.colSpan} className="px-3 py-1.5">{t.name}</td>
      </tr>
    ))
  }
  footer={(ctx) => (
    <tr>
      <td colSpan={ctx.colSpan} className="px-3 py-2">
        <Button variant="ghost" size="sm" onClick={addPeriod}>Add manually</Button>
      </td>
    </tr>
  )}
/>

<Table columns={columns} data={rows} stickyHeader="scrollParent" stickyHeaderOffset={56} />

// Grouped (multi-level) headers, the equivalent of nesting el-table-column: wrap
// columns in a `columns` array. The group name spans its leaves and is centred;
// a column outside any group spans both header rows instead of leaving a blank cell.
const groupedColumns: ColumnDef<DemoRow, any>[] = [
  { accessorKey: "zone", header: "Region" },
  {
    id: "wecom",
    header: "WeCom",
    columns: [
      { accessorKey: "dept", header: "Department", size: 220 },
      { accessorKey: "users", header: "Members" },
    ],
  },
  { id: "mini", header: "Mini Program", columns: [
      { accessorKey: "store", header: "Store" },
      { accessorKey: "pos", header: "POS code" }] },
];
<Table columns={groupedColumns} data={rows} />

<TableRoot density="compact">
  <TableHeader>
    <TableRow>
      <TableHead>Field</TableHead>
      <TableHead align="right">Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {fields.map((f) => (
      <TableRow key={f.key} selected={f.key === active}>
        <TableCell>{f.label}</TableCell>
        <TableCell align="right">{f.editing ? <Input defaultValue={f.value} /> : f.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>{fields.length} entries</TableCell>
    </TableRow>
  </TableFooter>
</TableRoot>

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

- **Memoize `columns`.** TanStack's `flexRender` renders a function `cell` **as a component type**, so a changed identity **unmounts and remounts** the whole cell rather than re-rendering it. On a display-only table that merely burns time; with an input inside the cell it breaks behavior: a controlled input loses focus on every keystroke and the caret jumps to the end, an `onBlur` submit fires on the remount blur and **commits a half-typed value**, and an uncontrolled input snaps back to its `defaultValue` and loses characters. None of those symptoms point at the columns array, so debugging usually starts by blaming the input component. For the same reason, never put a per-keystroke value in the `useMemo` dependencies, since that is the same as no memo. Prefer uncontrolled inputs for inline editing.
- When forwarding primitive props through a thin wrapper, `Omit` the `align` from `TableHeadProps` and `TableCellProps` the same way they do: those interfaces replace the native `align` (a wider union that includes `justify` and `char`) with `"left" | "center" | "right"`, so extending `ThHTMLAttributes<…>` directly is not assignable.
- A sticky header needs `stickyHeader` **and** `maxHeight`: sticky positioning requires an ancestor that actually scrolls vertically, and the shell only has `overflow-x-auto` with no height constraint by default. Applying `[&_thead]:sticky` from product code cannot reach it either, because that overflow container sits in between.
- **"Horizontal scrolling inside the table plus a header pinned to the page" is not an available combination**, and that is a CSS constraint rather than an implementation trade-off: `overflow-x: auto` makes `visible` on the other axis compute to `auto`, so that shell becomes a scrollport itself and anchors the header to it. Measured in Chromium, the header slides straight off as the page scrolls, while the same table under an `overflow: visible` shell stops cleanly at `top: 0`. `stickyHeader="scrollParent"` therefore **drops `overflow-x-auto` from the shell** and leaves horizontal overflow to the outer scroll container; `stickyScrollbar` has nothing to mirror in that mode and is ignored with a warning. Keep `"self"` plus `maxHeight` when the horizontal scroll has to stay inside the table.
- `renderRowExtra` and `renderExpandedRow` are two different things, and the latter does not substitute for the former: a detail panel allows **one row at a time, only while expanded, and always adds an expander column**. "This employment period permanently carries N certificate rows" is part of the row, not a collapsible detail.
- `renderRowExtra` and `footer` return **bare `<tr>` elements**; the component does not wrap them in `<tr><td>`, because wrapping would make "one attached row split into three cells" inexpressible. Always take the `colSpan` of a full-width row from the callback context: `ctx.colSpan` includes the automatically prepended selection, expander, and drag-handle columns, so a value computed from `columns.length` is one to three columns short and leaves a gap on the right.
- `renderRowExtra` cannot be combined with `cellSpan`, for the same reason as `renderExpandedRow`: attached rows sit between data rows and a vertical span would cross them. The combination skips merging and warns in development.
- `renderRowExtra` with `virtual` throws off the virtualizer's height estimate, which assumes one `rowHeight` per record when sizing its spacer rows; the symptom is drifting scroll position and blank space at the bottom. The component only warns instead of disabling the slot, because silently dropping the attached rows would be harder to diagnose than the misalignment. When the number of attached rows is fixed, set `virtual.rowHeight` to the combined height of the data row and its attached rows.
- The primitives have no sorting, pagination, pinned columns, or virtualization. They are only a skin. Go back to the high-level `Table` for those instead of rebuilding them by hand.
- The primitives default `striped` to `false`, the opposite of the high-level `Table`. Stripes count `<tr>` elements, and hand-written structures with attached or merged rows make that count disagree with the visual grouping of a record. Enable it explicitly once rows really are one record each.
- Set the minimum width of a wide table through `minWidth`, **never through `className`**: `className` lands on the scroll shell, so `min-w-*` stops the container from shrinking, `scrollWidth` equals `clientWidth`, the horizontal scrollbar never appears, and off-screen columns are clipped and unreachable. A wide browser window hides the problem entirely.
- `meta.whitespace` and `meta.ellipsis` are two mutually exclusive routes, because truncation requires a single line. For a review-style table that must wrap rather than truncate, combine `whitespace: "normal"`, `maxSize` for the width cap, and `verticalAlign: "top"`. Without top alignment the short cells in the row float on the middle line and no longer line up with the first line of the long ones.
- Width styles are emitted only for explicit `size`, `minSize`, or `maxSize`; this avoids TanStack's default size turning every auto-layout column into equal 150 px widths.
- Ellipsis needs a definite `size`, `maxSize`, or fixed layout. Its tooltip uses the raw string or number, not arbitrary custom-cell content.
- Sticky offsets sum `getSize()`, so pinned columns are forced to that width; set `size` explicitly and ensure content is wide enough to scroll.
- Resizing forces fixed layout. If summed widths are narrower than the container, `min-w-full` lets the browser stretch them and no horizontal scroll occurs.
- The `cellSpan` callback runs **only for cells that are not already covered**, so the "merge while the store matches the previous row" pattern is to return the whole run length at the start of the run (`while (rows[i + n]?.store === rows[i].store) n++`); the following rows are never asked. The el-table `[0, 0]` style is also honored: returning `rowSpan: 0` hides that cell.
- `cellSpan` receives a `rowIndex` in **render order** (after sorting and filtering), and `rows` is ordered the same way. That is what avoids the classic el-table trap where enabling column sorting shifts the whole merge map: base the decision on the data, never on the original index.
- `cellClassName` lands on the `<td>` itself and sits **last** in the class string, so a background or text colour it returns wins over the stripe and pinned-column colours, which is exactly what full-cell colouring needs. Do not return a `bg-*` class on a pinned column unless you mean to replace its opaque background. The callback also runs for the built-in leading columns (`__select__`, `__expander__`, `__drag__`); skip them via `ctx.columnId`.
- `meta.filterRender` is a **callback, not a component** (the same contract as `ColumnDef.cell`): do not call hooks inside its body, keep state in your own control component. Clear a column filter with `setValue(undefined)`, not with an empty string, which is a valid value meaning "filter by the empty string".
- `filterPlacement="row"` renders that row as `<td>` cells inside `<thead>` rather than `<th>`: it holds controls, not column names, and header cells would be announced as a second level of column names. The row is not rendered when no column is filterable.
- `cellSpan` **cannot be combined** with `virtual` or `renderExpandedRow`. Virtualization renders only the visible window, so a vertical span has nowhere to land, and an expanded panel inserts a `<tr>` between data rows that a vertical span would cross. In both cases the component skips merging and warns in development rather than rendering a misaligned table.
- With pinned columns (`meta.sticky`), a horizontal span **must not cross the pinned boundary**: pinned offsets accumulate from the unmerged column widths, so a span across the edge misplaces the cell next to it.
- **Under grouped headers, pinning only applies to leaf columns.** Offsets accumulate from leaf column widths, and a group name spanning several columns has no offset of its own, so it scrolls with the content while only the row of leaf headers below it stays at the edge. When combining grouped headers with pinned columns, keep the pinned ones outside any group -- a standalone column spans both header rows and reads the same.
- **Sorting and filtering in a grouped header live on the leaf columns**; the group cell has no sort button. A group column has no accessor, so "which column is being sorted" is undefined. Enable `enableSorting` on the leaf you want to sort by.
- Column widths in a grouped header belong on the **leaf** columns (`size` / `minSize` / `maxSize`). Setting them on the group does not distribute anything downward -- a group is as wide as its leaves add up to.
- A row hidden behind a vertical span is still **its own row** for selection and dragging; merging is purely visual.
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
