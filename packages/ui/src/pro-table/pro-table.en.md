---
slug: pro-table
name: ProTable
category: data-display
group: collection
tags: []
exports: [ProTable]
status: enriched
---

# ProTable

> Combines business-table columns, querying, sorting, selection, pagination, and toolbar actions. · data-display/collection

## When to use

Use ProTable for a complete enterprise list page: search form, toolbar, table, and pagination in one component. Prefer it for server pagination, sorting, and filtering. [Table](../table/table.md) is the lower-level table skin; ProTable's managed mode also owns the request lifecycle.

## Import
```ts
import { ProTable } from "@hulianui/ui"
```

## Props

Inherits `Omit<TableProps<TData>, "data">`, including columns, sorting, selection, density, row identity, and row classes, and adds:

> Enable `virtual` for large result sets. It is inherited from Table even though it is not repeated in the table below:
>
> ```tsx
> <ProTable columns={columns} request={fetchRows} virtual={{ enabled: true, height: 480 }} />
> ```
>
> See [Table `virtual`](../table/table.md) for parameters and constraints. It requires `@tanstack/react-virtual` and is not recommended with trees, expanded detail panels, or row drag-and-drop.

| Name | Type | Default | Description |
|------|------|------|------|
| data | `TData[]` | - | Required in display mode; ignored when `request` enables managed mode. |
| request | `(params: ProTableRequestParams) => Promise<ProTableRequestResult<TData>>` | - | Enables managed data, paging, sorting, filters, loading, and selection. Held in a ref, so function identity is not a request dependency. |
| params | `Record<string, unknown>` | - | Fixed managed-mode parameters. Shallow changes reset to page one and re-request; values remain separate from filters. |
| paginationMode | `"page" \| "cursor"` | `"page"` | Page mode returns `{data,total}`; cursor mode receives a cursor and returns `{data,nextCursor,hasMore}`. |
| defaultPageSize | `number` | `10` | Initial managed page size. |
| defaultSorting | `SortingState` | `[]` | Initial managed sorting, read only on first mount and sent with the first request. |
| pageSizeOptions | `number[]` | - | Renders a page-size selector when supplied. |
| pagination | `ProTablePagination` | - | Display-mode footer pagination: `{page,pageSize,total,onPageChange,showFirstLast?,onPageSizeChange?}`. |
| search | `Omit<SearchFormProps,"onSearch"> & { onSearch? }` | - | Integrated SearchForm; `onSearch` is optional in managed mode. |
| toolbar | `boolean \| ProTableToolbarFeatures` | `true` | True enables all tools, false hides the toolbar, or configure reload, density, column settings, and fullscreen individually. |
| loading | `boolean` | - | Display-mode loading state, including the rotating refresh icon. |
| actionRef | `Ref<ProTableActions>` | - | Exposes `reload()` and `clearSelection()`. |
| columnVisibility | `Record<string, boolean>` | - | Controlled column visibility, mapping column id to visibility, where **a missing key means visible**. It follows the `rowSelection` and `sorting` contract: supplying it takes control and requires `onColumnVisibilityChange`, omitting it keeps internal state. Column ids come from `ColumnDef.id`, falling back to `accessorKey`. Columns carrying `meta.lockVisible` stay visible, so writing `false` for them has no effect. |
| rootClassName | `string` | - | Outer container class, distinct from the Table `className`. |

## Events

Inherited Table events include sorting, selection, expansion, and column-filter changes. ProTable adds:

| Event | Type | Description |
|------|------|------|
| onReload | `() => void` | Called from the toolbar reload control. |
| onRequestError | `(error: unknown) => void` | Managed request failure handler; defaults to `console.error`, resets loading, and preserves previous data. |
| onColumnVisibilityChange | `(next: Record<string, boolean>) => void` | Column-visibility change. It reports **the complete next map**, not a patch, so it can be written straight to local storage or PATCHed back to the server. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Card title on the left side of the toolbar. |
| toolbarActions | `ReactNode` | Custom actions before the built-in toolbar controls. |
| batchActions | `(ctx: ProTableBatchCtx) => ReactNode` | Renders batch operations when selection is enabled and rows are selected. |

## Examples
```tsx
<ProTable
  title="Employees"
  columns={columns}
  data={pageData}
  enableRowSelection
  onReload={reload}
  toolbarActions={<Button size="sm">+ Add</Button>}
  search={{ fields, onSearch, onReset }}
  pagination={{ page, pageSize, total, onPageChange: setPage }}
/>

<ProTable<Row>
  title="Employees"
  columns={columns}
  request={async ({ page, pageSize, sort, filters }) => {
    const { rows, total } = await api.list({ page, pageSize, sort, filters });
    return { data: rows, total };
  }}
  getRowId={(r) => String(r.id)}
  search={{ fields: searchFields }}
  pageSizeOptions={[10, 20, 50]}
/>

// Inline request and shallow inline params are stable by design.
<ProTable<Row>
  title="Sort weight"
  columns={columns}
  defaultSorting={[{ id: "weight", desc: true }]}
  params={{ categoryId }}
  request={async ({ page, pageSize, sort, filters, params }) => {
    const { rows, total } = await api.list({ page, pageSize, sort, ...filters, ...params });
    return { data: rows, total };
  }}
  getRowId={(r) => String(r.id)}
/>
```

## Usage notes

- **Memoize `columns`** (same root cause as [Table](../table/table.md)): TanStack's `flexRender` renders a function `cell` as a component type, so a changed identity unmounts and remounts the cell. With an input inside, a controlled field loses focus on every keystroke and an `onBlur` submit fires on the remount blur, committing a half-typed value. Never put a per-keystroke value in the `useMemo` dependencies, and prefer uncontrolled inputs for inline editing.

- In managed mode, `data`, `pagination`, and `loading` are ignored. Cursor mode has no total or random page jump; changing filters, sorting, or page size resets to page one.
- Supply `getRowId` in managed mode so selection remains stable across pages. `batchActions` also requires enabled selection and at least one selected row.
- **Row selection is controlled by whether you pass `rowSelection`, not by whether the table is managed.** Passing it makes selection controlled, so pass `onRowSelectionChange` too. Without it nothing can be selected and only a dev warning says why. Omit both and the component holds selection internally. Through 0.29.0 managed mode always held selection and silently discarded these two props: the table looked completely normal, checkboxes toggled and the header box went indeterminate, yet the consumer state stayed `{}` until submit produced an empty array (#202).
- **Column visibility follows the same controlled contract** as selection: supplying `columnVisibility` means you own it and must also supply `onColumnVisibilityChange`, otherwise the column-setting popover does nothing and only warns in development. Without it the preference lives in internal state only, so the toolbar works but a refresh throws it away, and "the same operator switches machines and keeps their columns" cannot be written at all from outside the component. The map means **missing equals visible**, so persistence only has to record the columns that were switched off.
- **Mark identity and action columns with `meta.lockVisible`.** A blanket on/off list cannot express "these two may not be switched off", and a row without its identity column or its action column has neither a name nor an exit. Locked columns are checked and disabled in the toolbar, and a controlled `false` does not apply to them either, otherwise one stale persisted preference could close the exit with no way to reopen it from the UI.
- The guard against hiding the last visible column (which would leave an empty header) is still in place; in controlled mode it shows up as **the change handler simply not firing**.
- Request rejection falls back to `console.error`; use `onRequestError` for a production toast or report.
- `request` is held in a ref. Inline functions do not loop, but replacing only the function does not reload; change `params` or call `actionRef.reload()`.
- `defaultSorting` is an uncontrolled initial value. Later changes do not overwrite user sorting; remount with a key or use controlled `sorting`.
- `params` is compared only one level deep. Flat inline objects are safe; keep nested values referentially stable or flatten them.
- `params` stays separate from `filters`, so fixed constraints cannot be reset or overwritten by the search form. Merge them explicitly inside `request`.
- Any `params` content change resets page mode to page one and cursor mode to the start.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
