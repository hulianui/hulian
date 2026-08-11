---
slug: editable-table
name: EditableTable
category: data-display
group: collection
tags: []
exports: [EditableTable]
status: enriched
---

# EditableTable

> Inline-editing table · row drafts, validation, save/cancel restoration, custom editors, row add/delete, column sizing and alignment, with consumer-owned copy · data-display/collection

## When to use

Use EditableTable for row-by-row entry inside quotations, invoice details, or staffing configuration. Use [Table](../table/table.md) for read-only display, or [ProTable](../pro-table/pro-table.md) for a full list page with search, toolbar, and pagination.

## Import
```ts
import { EditableTable } from "@hulianui/ui"
```

## Props

`EditableTableProps<T>`:

| Name | Type | Default | Description |
|------|------|------|------|
| columns* | `EditableColumn<T>[]` | — | Column definitions described below. |
| data* | `T[]` | — | Controlled data array. |
| rowKey* | `(row: T) => string` | — | Stable row key. |
| addable | `boolean` | `false` | Shows the add-row action; requires `newRow`. |
| newRow | `() => T` | — | Factory whose new row immediately enters edit mode. |
| deletable | `boolean` | `false` | Enables row deletion. |
| validateRow | `(row: T) => boolean` | — | Blocks save on a falsy result; the consumer renders errors. |
| className | `string` | — | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(next: T[]) => void` | Returns the complete next array after save, delete, or add. |

## Slots

| Slot | Type | Description |
|------|------|------|
| summary | `(data: T[]) => ReactNode` | Renders raw `tfoot` content; the consumer controls `<tr>` and `colSpan`. |

`EditableColumn<T>`:

| Name | Type | Default | Description |
|------|------|------|------|
| key* | `keyof T & string` | — | Data key. |
| title* | `ReactNode` | — | Column title. |
| editable | `boolean` | `false` | Makes the cell editable; false stays read-only during editing. |
| render | `(value, row) => ReactNode` | — | Display renderer; defaults to the raw value. |
| editor | `(value, onChange, row) => ReactNode` | — | Edit renderer; defaults to a text input writing into the draft. |
| width | `number` | — | Width in pixels. |
| align | `"left" \| "center" \| "right"` | `"left"` | Cell alignment. |

## Example
```tsx
const [data, setData] = useState(rows);
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "Name", editable: true, width: 160 },
  { key: "salary", title: "Monthly salary", editable: true, align: "right",
    render: (v) => `$${Number(v).toLocaleString()}`,
    editor: (v, onChange) => (
      <input type="number" value={v as number}
        onChange={(e) => onChange(Number(e.target.value))} />
    ) },
];

<EditableTable<Row>
  columns={columns}
  data={data}
  rowKey={(r) => String(r.id)}
  onChange={setData}
  addable
  deletable
  newRow={() => ({ id: Date.now(), name: "", salary: 0 })}
/>
```

## Usage notes

- **Memoize `columns`** (same root cause as [Table](../table/table.md)): TanStack's `flexRender` renders a function `cell` as a component type, so a changed identity unmounts and remounts the cell. With an input inside, a controlled field loses focus on every keystroke and an `onBlur` submit fires on the remount blur, committing a half-typed value. Never put a per-keystroke value in the `useMemo` dependencies, and prefer uncontrolled inputs for inline editing.

- Data is controlled. Write `next` from `onChange` back to state or saves and row changes will not appear.
- `validateRow` only blocks saving; render any validation message inside a custom `editor`.
- `summary` is raw table-footer content, so the consumer owns column spans and alignment.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [List](../list/list.md)
