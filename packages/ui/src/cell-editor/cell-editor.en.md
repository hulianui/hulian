---
slug: cell-editor
name: CellEditor
category: forms
group: basic
tags: []
exports: [CellEditor]
status: enriched
---

# CellEditor

> Inline cell editor · always-on per-cell editing primitive: looks like plain text at rest, commits on blur or Enter, skips unchanged values, rolls back on Esc, dims missing values, grows with `field-sizing`, and handles its own pending state when `onCommit` returns a promise · forms/basic

## When to use

Use CellEditor for review and backfill tables — the ones where a user scans a screen of existing data and fixes a single word in place. Every cell carries an editor that looks like text, there is no edit or save button, and losing focus commits that one cell.

It is not a reskin of [EditableTable](../editable-table/editable-table.md); the two are different interaction contracts:

| | EditableTable (row level) | CellEditor (per cell) |
|------|------|------|
| Entering edit mode | Click edit, or add a row | Never needed; always editable |
| Commit granularity | The whole row at once | One cell |
| Commit trigger | Save button | Blur or Enter |
| Undo | Cancel the row | Esc rolls that cell back |
| Appearance | Explicit form controls | Borderless and transparent; identical to plain text at rest |
| Typical use | Quotation and invoice entry | Reviewing or backfilling existing data |

This component is only the editor layer. Keep the table shell in [Table](../table/table.md) with top alignment and non-truncating wrapping, so sorting, pinned columns, and virtual scrolling do not get rebuilt inside an editor. Use [EditableTable](../editable-table/editable-table.md) for the click-edit-then-save-row flow, and [Input](../input/input.md) / [Textarea](../textarea/textarea.md) for an ordinary bordered field.

## Import
```ts
import { CellEditor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | — | The committed value (controlled source). Write the new value back after a successful commit; the component resets its draft and its equality baseline from it. |
| missing | `boolean` | `false` | Marks the field as not filled in yet: renders muted and italic so that "empty" and "filled with spaces" stay distinguishable at a glance. |
| multiline | `boolean` | `false` | Switches to a textarea that grows through CSS `field-sizing: content`; the default is a single-line input. |
| disabled | `boolean` | `false` | Disables the editor. When `onCommit` returns a promise the component disables itself for the pending window, so no extra flag is needed. |
| placeholder | `string` | — | Placeholder copy, usually a "not filled in" string in review tables. |
| className | `string` | — | Applied to the outermost node. |

Remaining native attributes (`aria-label`, `id`, `onFocus`, `data-*`, …) reach the editing control itself: an `<input>` in single-line mode and a `<textarea>` in multiline mode.

## Events

| Event | Type | Description |
|------|------|------|
| onCommit | `(next: string) => void \| Promise<void>` | Fires on blur and on Enter. **It is not called when the value equals the previously committed one**; returning a promise disables the editor while it is pending. |

## Example
```tsx
const [row, setRow] = useState(initialRow);

<CellEditor
  aria-label="Contact"
  value={row.contact}
  missing={row.contact.trim() === ""}
  placeholder="Not filled in"
  onCommit={async (next) => {
    await api.patch(row.id, { contact: next });
    setRow((prev) => ({ ...prev, contact: next }));
  }}
/>
```

Multiline, for long text such as billing addresses and remarks:
```tsx
<CellEditor multiline value={row.address} onCommit={(next) => save("address", next)} />
```

## Pitfalls

- **Do not re-check equality inside `onCommit`.** The component already did; an unchanged value never reaches you. Review workflows are full of "click in, look, click away", and this check is what keeps a screenful of empty writes off the backend.
- **A blur right after Esc does not resend the old value.** Esc writes the draft back to the last committed value, so the following blur short-circuits on the equality check. You never need a "just pressed Esc" flag. Esc only rolls back; it does not move focus.
- **Enter commits, Shift+Enter inserts a newline.** In multiline mode the newline belongs to Shift+Enter; in single-line mode Enter is prevented so it cannot submit the surrounding form.
- **Growth comes from CSS `field-sizing: content`, not from measuring in JS.** Dozens of cells reading `scrollHeight` at once drop frames while scrolling, and the measurement fights with column resizing. Do not wrap another sizing layer around it.
- **Catch your own `onCommit` failures.** The component only ends the pending state; rollback and error copy depend on business semantics it cannot decide for you.
- **The parent must write the new value back into `value`.** Without the write-back the editor keeps showing its own draft, and the next external refresh snaps the display back to the old value.
- **Memoize `columns` when using it inside [Table](../table/table.md).** Cell functions are rendered as component types by the TanStack `flexRender`, so a changed identity unmounts and remounts the whole cell — and a remount fires the blur that commits.

## Related
[EditableTable](../editable-table/editable-table.md) · [Table](../table/table.md) · [Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [ProTable](../pro-table/pro-table.md)
