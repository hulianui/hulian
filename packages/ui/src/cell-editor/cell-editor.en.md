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
| validate | `(next: string) => string \| undefined` | — | Pre-commit check: returning a string means that string is the error message, which blocks `onCommit` and renders below the cell; returning `undefined` (or an empty string) lets the value through. See below. |
| missing | `boolean` | `false` | Marks the field as not filled in yet: renders muted and italic so that "empty" and "filled with spaces" stay distinguishable at a glance. |
| multiline | `boolean` | `false` | Switches to a textarea that grows through CSS `field-sizing: content`; the default is a single-line input. To switch on a runtime variable, render two branches; see "Pitfalls". |
| revertOnError | `boolean` | `false` | Rolls the draft back to the last committed value when the `onCommit` promise rejects. The equality baseline rolls back either way; see below. |
| blurOnCommit | `boolean` | `false` | Releases focus after Enter commits. Focus stays put when `validate` blocks the commit, because the error is in this very cell and the user has to fix it. |
| blurOnEscape | `boolean` | `false` | Releases focus after Esc rolls back. |
| variant | `"default" \| "cell"` | `"cell"` | Appearance, forwarded to the inner [Input](../input/input.md) / [Textarea](../textarea/textarea.md). `"cell"` is borderless and transparent; use `"default"` when the other editable columns in the same row are ordinary fields. See below. |
| size | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Type scale, forwarded to the inner Input / Textarea. |
| disabled | `boolean` | `false` | Disables the editor. When `onCommit` returns a promise the component disables itself for the pending window, so no extra flag is needed. |
| placeholder | `string` | — | Placeholder copy, usually a "not filled in" string in review tables. |
| className | `string` | — | Applied to the outermost node. |

Remaining attributes reach the editing control itself, per mode: single-line mode accepts the native `<input>` attributes (`name`, `type`, `maxLength`, `autoComplete`, …) and multiline mode accepts the `<textarea>` ones (`name`, `rows`, `wrap`, …). In multiline mode `rows` is a minimum height, and it defaults to 1 in the `cell` variant.

The native `size` attribute cannot be passed: it is the character width of an `<input>`, which collides in name but not in meaning with the `size` scale in the table above, so only one of them can stay. Use a CSS width when you need a character-count width.

## Events

| Event | Type | Description |
|------|------|------|
| onCommit | `(next: string) => void \| Promise<void>` | Fires on blur and on Enter. **It is not called when the value equals the previously committed one**; returning a promise disables the editor while it is pending. It is also **not called** when `validate` returns an error string. |
| onDraftChange | `(draft: string) => void` | A **read-only echo** of the draft, once per keystroke, leaving equality checks, validation, and the pending state exactly as they were. It exists for UI derived from what is being typed: filled-in counters, live previews, per-keystroke `localStorage` writes. **It only reflects typing** — an Esc rollback and an external write into `value` do not broadcast. |

The order is equality check, then `validate`, then `onCommit`: an unchanged value is never validated, because it already passed last time, and a value that fails validation never leaves the component.

`onCommit` is still the only place a value actually leaves. If you persist inside `onDraftChange` you have routed around the commit-on-blur contract, and neither the equality check nor `validate` can stop it.

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

### validate: an illegal value must not be written first and rolled back afterwards

Commit-on-blur means that without a validation layer an illegal value is handed over first and rolled back by the consumer — and by then the caret is already in the next cell, so what the user sees is their own edit reverting itself. `validate` moves that layer earlier: return a string and `onCommit` is blocked, the value never leaves, and the error shows up in place.

```tsx
<CellEditor
  value={row.months}
  validate={(next) => {
    if (!/^\d+$/.test(next)) return "Digits only";
    if (Number(next) > 480) return "Months cannot exceed 480";
    return undefined;
  }}
  onCommit={(next) => save("months", Number(next))}
/>
```

While blocked the draft is **not** rolled back, so the user keeps looking at the string they got wrong, and the equality baseline does not advance either — the same illegal value is blocked again on the next blur, and only a corrected value commits. The red indicator reuses the inset underline already present in the `cell` variant of `Input` and `Textarea` (an `inset` shadow, so there is zero layout shift), and the error string is linked to the control through `aria-describedby`.

Typing again, pressing Esc, or restoring the previously committed value all clear the error, because all three mean the message on screen no longer describes what is in the cell.

Cross-cell constraints such as "end time is before start time" belong here too: `validate` is a closure, so read the other fields of the same row directly.

### variant: do not mix bordered and borderless within one row

The default `cell` variant solves the "the cell itself is the field" case: tiled densely, a border plus a background plus a focus ring turns into boxes inside boxes, and the focus ring spills over into the neighbouring cell.

If the other editable columns of the same row are ordinary [Input](../input/input.md) / [Textarea](../textarea/textarea.md) fields, however, only these cells lose their border, and the user has to remember rather than see which cells can be edited. In that kind of table switch these cells to `variant="default"` so they match their neighbours:

```tsx
<CellEditor variant="default" size="sm" value={row.months} onCommit={(next) => save("months", next)} />
```

### onCommit failures: the baseline rolls itself back, rolling back the draft is opt-in

When the promise returned by `onCommit` rejects, the component moves the equality baseline back to the previously committed value. A rejection is exactly the proof that the value never got through, and a baseline that records it as committed makes the next blur short-circuit — which means the user cannot even retry after a failed save.

The draft stays put by default: what the user typed is still there, so editing it and blurring again is the retry. If `value` for this cell comes from a server cache (SWR, React Query, a Redux selector), a failure leaves the cache untouched and `value` unchanged, so the consumer has nothing to roll back with — turn on `revertOnError` and the display returns to its pre-failure state as well:

```tsx
<CellEditor
  value={row.contact}
  revertOnError
  onCommit={async (next) => {
    try {
      await api.patch(row.id, { contact: next });
      await mutate();
    } catch (err) {
      toast({ title: "Save failed, reverted", tone: "danger" });
      throw err; // Rethrow: swallowing the error tells the component the save succeeded
    }
  }}
/>
```

Error copy is still the consumer's call; the component only walks its own internal state back to the truth. A new value written into `value` while the request is in flight is not rolled back — that is the more recent truth, and a stale failure must not overwrite it.

### blurOnCommit / blurOnEscape: done with this cell, move on

Both default to `false`, so focus stays inside the cell. When an operator works through a wide review table, pressing Enter means "this cell is done", and a caret still blinking in it reads as "nothing happened", so they press it again — that is what `blurOnCommit` is for, and `blurOnEscape` does the same for walking away after Esc. They are separate flags because Enter and Esc mean opposite things here ("I am done editing" versus "I am not editing this"), and usually only one of them is wanted.

**Do not add your own `blur()` inside `onKeyDown`.** `blur()` is synchronous: it triggers the commit before the draft update has reached the next render, so the commit reads the stale draft — which turns Esc into a save.

## Pitfalls

- **Do not re-check equality inside `onCommit`.** The component already did; an unchanged value never reaches you. Review workflows are full of "click in, look, click away", and this check is what keeps a screenful of empty writes off the backend.
- **A blur right after Esc does not resend the old value.** Esc writes the draft back to the last committed value, so the following blur short-circuits on the equality check. You never need a "just pressed Esc" flag. By default Esc only rolls back and leaves focus alone; if you want it to release focus too, turn on `blurOnEscape` instead of calling `blur()` yourself.
- **Write `multiline` as a literal.** The attribute set forks on it (single-line mode takes the native `<input>` attributes, multiline mode the `<textarea>` ones), so TypeScript cannot tell which side a boolean variable lands on. If the mode really is decided at runtime, render two branches.
- **`onDraftChange` is not a commit path.** It fires once per keystroke, with neither the equality check nor `validate` involved. Persisting there routes around the whole commit-on-blur contract.
- **Enter commits, Shift+Enter inserts a newline.** In multiline mode the newline belongs to Shift+Enter; in single-line mode Enter is prevented so it cannot submit the surrounding form.
- **Growth comes from CSS `field-sizing: content`, not from measuring in JS.** Dozens of cells reading `scrollHeight` at once drop frames while scrolling, and the measurement fights with column resizing. Do not wrap another sizing layer around it.
- **Send client-checkable rejections through `validate` instead of rolling back inside `onCommit`.** By the time a rollback happens the caret is in the next cell, and all the user sees is their edit reverting itself. What remains for `onCommit` is failure only the server can know about, such as name collisions or concurrent writes, and that kind still needs your own catch.
- **Returning an empty string from `validate` lets the value through.** An invisible error that still blocks the commit is worse than no check at all: the user only sees that the cell will not save, with nothing on screen. If you want to block, give them a sentence they can read.
- **Do not swallow `onCommit` failures.** A rejected promise is how the component learns the value never got saved, which is what lets it move the equality baseline back so the user can retry. If your `catch` shows a toast and stops there, the component sees a successful commit. Error copy and whether the draft rolls back (`revertOnError`) are still yours to decide.
- **The parent must write the new value back into `value`.** Without the write-back the editor keeps showing its own draft, and the next external refresh snaps the display back to the old value.
- **Memoize `columns` when using it inside [Table](../table/table.md).** Cell functions are rendered as component types by the TanStack `flexRender`, so a changed identity unmounts and remounts the whole cell — and a remount fires the blur that commits.

## Related
[EditableTable](../editable-table/editable-table.md) · [Table](../table/table.md) · [Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [ProTable](../pro-table/pro-table.md)
