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

> Query-filter form for admin list pages · declarative fields + fixed-column grid + one-row collapse + Search/Reset actions · built from HulianUI primitives · forms/framework

## When to use

Use SearchForm for the filter area above an admin list. Declare query fields with `fields`; the component arranges them in a fixed-column grid, collapses overflow to one row, and supplies Search and Reset actions. Unlike [Form](../form/form.md) and [ProForm](../pro-form/pro-form.md), which submit business records, SearchForm emits filter parameters through `onSearch`. It is commonly used as [ProTable](../pro-table/pro-table.md)'s `search` area.

## Import
```ts
import { SearchForm, planLayout, canCollapse, totalSpan } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| fields* | `SearchField[]` | — | Field configuration array |
| values | `Record<string, unknown>` | — | Controlled values; omit for internal state. |
| columns | `number` | `3` | Number of desktop columns |
| gap | `number` | `4` | Row and column gap (× 0.25rem). |
| collapsible | `boolean` | `true` | Enables one-row collapse when fields exceed one row; has no effect otherwise. |
| defaultCollapsed | `boolean` | `true` | Initial collapsed state. |
| loading | `boolean` | `false` | Query button loading state |
| className | `string` | — | Root node class name |

## Events

| Event | Type | Description |
|------|------|------|
| onSearch* | `(values: Record<string, unknown>) => void` | Query / Enter to submit |
| onChange | `(values: Record<string, unknown>) => void` | Triggered by any field edit (controlled backfill) |
| onReset | `(values: Record<string, unknown>) => void` | Reset (values = value after default of each field) |

## Slots

| Slot | Type | Description |
|------|------|------|
| submitText | `ReactNode` | Primary button label (default `"Search"`). |
| resetText | `ReactNode` | Reset button label (default `"Reset"`). |

`SearchField` is a discriminant combination (distinguished by `type`/`render`, the default is `input`). Public fields: `name*` (value key), `label*`, `placeholder?`, `colSpan?` (default 1, capped columns), `defaultValue?`. Various forms:
- `type?: "input"` + `inputType?: string`
- `type: "number"` + `min?` / `max?` / `step?` (transparent native input)
- `type: "number-range"` + the same three items as above (the value is a tuple)
- `type: "select"` + `options: { value: string; label: ReactNode }[]`
- `type: "multi-select"` + `options` (value is `string[]`)
- `type: "remote-select"` + `fetcher` (signature is the same as RemoteSelect) + `resolveValue?` + `multiple?`
- `type: "date"` / `type: "date-range"`
- `type: "datetime"`/`type: "datetime-range"` (native `datetime-local`)

**The value shape is determined by type**: `*-range` is always a binary tuple `[start, end]` (the unfilled end is `""`);
`multi-select` and `remote-select multiple` are `string[]`; the rest are `string`.
After reset, each returns to `defaultValue` or the above empty shape - don't assume "reset = all empty strings".
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
  onReset={() => fetchList({})}
/>
```

## Usage guidelines

- Controlled usage requires `values` and `onChange`; without writeback, fields cannot be edited.
- Expand/Collapse appears only when total field span exceeds one row. With fewer fields it is suppressed automatically.
- `onReset` receives values after every field returns to its `defaultValue` or type-specific empty shape, not `{}`. Re-query with that callback value to retain default filters.
- **Query operators such as `LIKE`, `BETWEEN`, and `=` do not belong in SearchForm.** They are part of the backend contract. Translate values into the API request shape inside `onSearch`; encoding one backend's protocol in field configuration would couple the library to that service.
- `datetime` and `datetime-range` use native `datetime-local`, so values are local-time strings without a timezone, such as `"2026-07-29T14:30"`. Do not call `new Date(...).toISOString()` blindly; in UTC+8 it shifts the value by eight hours without reporting an error. Convert explicitly in `onSearch` if the API requires ISO timestamps.
- RemoteSelect's `onChange` also returns complete options, but SearchForm stores only its first value argument. Use the `render` escape hatch when the raw row is required.

## Related
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md)
