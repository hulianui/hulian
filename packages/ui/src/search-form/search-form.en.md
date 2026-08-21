---
slug: search-form
name: SearchForm
category: forms
group: framework
tags: []
exports: [SearchForm, planLayout, canCollapse, totalSpan]
status: enriched
---

# SearchForm

> Builds collapsible query filters with reset and submit actions for data lists. · forms/framework

## When to use

Use SearchForm for the filter area above an admin list. Declare query fields with `fields`; the component arranges them in a fixed-column grid, collapses overflow to one row, and supplies Search and Reset actions. Unlike [Form](../form/form.md) and [ProForm](../pro-form/pro-form.md), which submit business records, SearchForm emits filter parameters through `onSearch`. It is commonly used as [ProTable](../pro-table/pro-table.md)'s `search` area.

## Import
```ts
import { SearchForm, planLayout, canCollapse, totalSpan } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| fields* | `SearchField[]` | - | Definitions for the filter fields. |
| values | `Record<string, unknown>` | - | Controlled values; omit for internal state. |
| columns | `number` | `3` | Number of columns at desktop widths. |
| gap | `number` | `4` | Row and column gap (× 0.25rem). |
| collapsible | `boolean` | `true` | Enables one-row collapse when fields exceed one row; has no effect otherwise. |
| defaultCollapsed | `boolean` | `true` | Initial collapsed state. |
| loading | `boolean` | `false` | Whether the Search button is in a loading state. |
| className | `string` | - | Additional class name for the root element. |

## Events

| Event | Type | Description |
|------|------|------|
| onSearch* | `(values: Record<string, unknown>) => void` | Called with the current filter values when Search is clicked or Enter is pressed. |
| onChange | `(values: Record<string, unknown>) => void` | Called after any field changes; use it to write back controlled values. |
| onReset | `(values: Record<string, unknown>) => void` | Called after reset with each field restored to its default or type-specific empty value. |

## Slots

| Slot | Type | Description |
|------|------|------|
| submitText | `ReactNode` | Primary button label (default `"\u67e5\u8be2"`, meaning “Search”). |
| resetText | `ReactNode` | Reset button label (default `"\u91cd\u7f6e"`, meaning “Reset”). |

`SearchField` is a discriminated union selected by `type` or `render`; omitting both creates an input field. Shared properties are `name*` (the value key), `label*`, `placeholder?`, `colSpan?` (defaults to 1 and is capped at `columns`), and `defaultValue?`. Supported variants are:
- `type?: "input"` + `inputType?: string`
- `type: "number"` + `min?` / `max?` / `step?` (forwards native input constraints)
- `type: "number-range"` + the same constraints (the value is a tuple)
- `type: "select"` + `options: { value: string; label: ReactNode }[]`
- `type: "multi-select"` + `options` (value is `string[]`)
- `type: "remote-select"` + `fetcher` (signature is the same as RemoteSelect) + `resolveValue?` + `multiple?`
- `type: "cascader"` + `options: TreeNode[]` (the `nodes` of Cascader) + `changeOnSelect?` / `showSearch?` (the value is a path array)
- `type: "region"` + `level?: 2 | 3` + `changeOnSelect?` / `showSearch?` (Chinese administrative divisions are built in, so no options are needed; the value is an array of division codes)
- `type: "date"` / `type: "date-range"`
- `type: "datetime"`/`type: "datetime-range"` (native `datetime-local`)

**The field type determines the value shape**: every `*-range` value is a two-item tuple `[start, end]`, with `""` for an unfilled endpoint; `multi-select` and a multiple `remote-select` use `string[]`; `cascader` and `region` use a root-to-leaf path array, which is `[]` while nothing is selected; all other built-in fields use `string`.
After reset, each field returns to its `defaultValue` or its type-specific empty shape. Do not assume every field resets to an empty string.
- `render: (ctx: { name; value; onChange }) => ReactNode` (escape hatch for a custom control)

## Example
```tsx
const fields: SearchField[] = [
  { name: "keyword", label: "Keywords", placeholder: "Order number / customer name" },
  { name: "status", label: "Status", type: "select", placeholder: "All",
    options: [
      { value: "pending", label: "Pending" },
      { value: "done", label: "Completed" },
    ] },
  { name: "range", label: "Created", type: "date-range", colSpan: 2 },
];

<SearchForm
  fields={fields}
  values={values}
  onChange={setValues}
  onSearch={(v) => fetchList(v)}
  onReset={(v) => fetchList(v)}
/>
```

## Usage guidelines

- Controlled usage requires `values` and `onChange`; without writeback, fields cannot be edited.
- Expand/Collapse appears only when total field span exceeds one row. With fewer fields it is suppressed automatically.
- `onReset` receives values after every field returns to its `defaultValue` or type-specific empty shape, not `{}`. Re-query with that callback value to retain default filters.
- **Query operators such as `LIKE`, `BETWEEN`, and `=` do not belong in SearchForm.** They are part of the backend contract. Translate values into the API request shape inside `onSearch`; encoding one backend's protocol in field configuration would couple the library to that service.
- `datetime` and `datetime-range` use native `datetime-local`, so values are local-time strings without a timezone, such as `"2026-07-29T14:30"`. Do not call `new Date(...).toISOString()` blindly; in UTC+8 it shifts the value by eight hours without reporting an error. Convert explicitly in `onSearch` if the API requires ISO timestamps.
- `cascader` and `region` produce a **path array** (root to leaf), and an unselected field is `[]`, not `""`. When the backend only accepts the leaf id, take `path.at(-1)` inside `onSearch`; enable `changeOnSelect` when an intermediate level should be submittable.
- The built-in administrative-division table behind `region` is about 137 KB, so that field type is **loaded on demand**: only a page that actually declares `type: "region"` fetches that chunk. Until it arrives the control's slot is an equally tall placeholder, so the query area never jumps.
- `region` reports **division codes** (`["11","1101","110101"]`) only. When the backend wants the name path, use the `render` escape hatch with [RegionCascader](../region-cascader/region-cascader.md), whose `onChange` provides the names as its second argument.
- RemoteSelect's `onChange` also returns complete options, but SearchForm stores only its first value argument. Use the `render` escape hatch when the raw row is required.

## Related
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md)
