---
slug: remote-select
name: RemoteSelect
category: forms
group: advanced
tags: []
exports: [RemoteSelect]
status: enriched
---

# RemoteSelect

> Remote search select · debounced queries + AbortSignal cancellation + infinite pagination + `resolveValue` label hydration + multi-select chips · forms/advanced

## When to use

Use RemoteSelect when options come from an **API** and the dataset is too large to load at once, such as stores, customers, products, or employees. It debounces text search, loads additional pages on scroll, and resolves selected labels when an edit form opens.

Use [Select](../select/select.md) for a fixed in-memory list, [Combobox](../combobox/combobox.md) for searching a consumer-provided array, or [CountrySelect](../country-select/country-select.md) for its built-in country and region data. RemoteSelect builds on Combobox but delegates filtering and pagination to the server.

## Import
```ts
import { RemoteSelect } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| fetcher * | `(query, { page, pageSize, signal }) => Promise<{ options, total? }>` | — | Remote search source. `options` contains raw API rows; when supplied, `total` determines whether another page exists. |
| resolveValue | `(values: string[]) => Promise<Row[]>` | — | Batch-resolves labels for existing values. **Required in edit forms**; see Usage guidelines. |
| labelKey | `string` | `"name"` | Field in each raw row used as its visible label. |
| valueKey | `string` | `"id"` | Field in each raw row used as its value. |
| debounce | `number` | `300` | Search debounce in milliseconds. |
| pageSize | `number` | `10` | Page size passed to `fetcher`. |
| multiple | `boolean` | `false` | Enables chip-based multiple selection and changes `value`/`onChange` to arrays. |
| value | `string\|number\|null` (array when multiple) | — | Controlled value. Array order determines chip order. |
| defaultValue | Same as above | — | Initial value when uncontrolled. |
| placeholder | `string` | `"\u8bf7\u9009\u62e9"` | Field placeholder; the built-in Chinese copy means “Please select.” |
| emptyMessage | `ReactNode` | `"\u65e0\u5339\u914d\u6570\u636e"` | Empty-state content; the built-in Chinese copy means “No matching data.” |
| loadingMessage | `ReactNode` | `"\u52a0\u8f7d\u4e2d\u2026"` | Loading-state content; the built-in Chinese copy means “Loading…”. |
| size | `"sm"\|"md"\|"lg"` | `"md"` | Field size. |
| clearable | `boolean` | `true` | Shows a clear button for single selection; multiple selections are removed from each chip. |
| disabled | `boolean` | `false` | Disables interaction. |
| invalid | `boolean` | `false` | Applies invalid styling when used outside Field. |
| defaultOpen | `boolean` | `false` | Opens the popup initially when uncontrolled, primarily for debugging and documentation. |
| renderOption | `(option) => ReactNode` | — | Custom option row; `option.raw` is the original API row. |
| virtualized | `boolean` | `true` once 100 options have accumulated | Virtualizes the candidate list. Turn it off explicitly when `renderOption` draws multi-line rows — see Usage guidelines. |
| className | `string` | — | Class name for the field shell containing the input or chips. |
| popupClassName | `string` | — | Additional popup class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | Single `(value: string\|null, option: Option\|null) => void`<br>Multiple `(value: string[], options: Option[]) => void` | Called when selection changes. The second argument contains complete options, including `raw`, in the same order as the values. |

## Example

Basic usage with debounced search and scroll pagination:
```tsx
<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  placeholder="Search store…"
  fetcher={async (query, { page, pageSize, signal }) => {
    const res = await fetch(`/api/stores?q=${query}&page=${page}&size=${pageSize}`, { signal })
    const json = await res.json()
    return { options: json.list, total: json.total }
  }}
/>
```

Edit-form label hydration when the value is not on the first page:
```tsx
<RemoteSelect
  valueKey="store_id"
  labelKey="store_name"
  value={form.storeId}
  onChange={(v) => setForm({ ...form, storeId: v })}
  fetcher={fetchStores}
  // Separate endpoint: resolves rows by ID and does not participate in search pagination
  resolveValue={async (ids) => (await api.storesByIds(ids)).list}
/>
```

Multiple selection:
```tsx
<RemoteSelect
  multiple
  valueKey="store_id"
  labelKey="store_name"
  value={form.storeIds}
  onChange={(ids) => setForm({ ...form, storeIds: ids })}
  fetcher={fetchStores}
  resolveValue={resolveStores}
/>
```

## Usage guidelines

- **The list virtualizes automatically once 100 candidates have accumulated** — remote paging appends page by page, so this switches on after enough pages. Only visible options stay in the DOM, and row height is estimated at a fixed 32px without per-item measurement. The default single-line label is exactly 32px, so nothing changes for it. **If** `renderOption` draws multi-line rows or avatars, placement starts drifting somewhere past the tenth page — **nothing throws, and the first pages never reproduce it**. Pass `virtualized={false}` for that usage.
- **`resolveValue` is required in edit forms.** An existing `value` may be on a later page or excluded by the current query. Only `resolveValue` can obtain its label; without it, the field displays the raw ID. Keep it separate from `fetcher`: one batch-fetches rows by primary key, while the other searches pages by keyword.
- **Forward `signal` from `fetcher` to fetch or Axios.** The component discards stale responses by request sequence even without cancellation, but uncancelled requests still occupy connections during rapid typing.
- **Render multiple-selection chips in `value` order.** `ComboboxChipRemove` associates each chip with `selectedValue[index]`; reordering custom output can **remove the wrong item**. The built-in rendering already preserves value order.
- There is no second local filter because the underlying Combobox uses `filter={null}`. Results are entirely server-defined; if `fetcher` ignores `query`, typing does not search.
- Closing the popup ends the search session: the query is cleared and the first page loads again on the next open, matching remote `el-select` behavior. Keep `fetcher` free of side effects beyond idempotent caching for identical parameters.
- Pagination works without `total` by assuming a page with at least `pageSize` rows may have a successor. This can cause one final empty request, so return `total` when the API provides it.

## Related
[Combobox](../combobox/combobox.md) · [Select](../select/select.md) · [CountrySelect](../country-select/country-select.md) · [Cascader](../cascader/cascader.md) · [ProTable](../pro-table/pro-table.md)
