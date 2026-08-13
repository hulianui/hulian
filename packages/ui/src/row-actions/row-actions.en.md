---
slug: row-actions
name: RowActions
category: data-display
group: collection
tags: []
exports: [RowActions]
status: enriched
---

# RowActions

> Table row action set - declarative actions, tone-based hierarchy, overflow menu past `max`, built-in confirmation for destructive actions - data-display/collection

## When to use

The row of actions in a table's "actions" column (view / edit / export / delete). It owns the shape of **row actions as a pattern**: which action outranks which, what happens when there are too many, how destructive ones are gated, and how disabled ones explain themselves.

Page-level bulk actions belong to [ProTable](../pro-table/pro-table.md)'s `batchActions`; toolbar actions to `toolbarActions`; a lone button is just a [Button](../button/button.md) and needs none of this.

## Import
```ts
import { RowActions } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| actions * | `RowActionItem[]` | — | The action list. `hidden` entries are dropped before collapsing is computed. |
| variant | `"text" \| "button" \| "icon"` | `"text"` | Three steps of prominence: borderless text, outlined buttons, icons only (the last requires an `icon` on every entry). |
| max | `number` | `3` | How many actions stay **visible**. Past that, the first `max - 1` stay out and the rest move into an overflow menu. |
| size | `"sm" \| "md"` | `"sm"` | Density step. |
| align | `"start" \| "center" \| "end"` | `"start"` | Alignment within the column. |
| moreLabel | `string` | localised "More actions" | Accessible name for the overflow trigger. |
| revealOnHover | `boolean` | `false` | Hidden until the row is hovered. **Requires `group/row` on the parent row element**; keyboard focus reveals it too, and it stays visible on touch devices. |

`RowActionItem`:

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | — | React key. |
| label * | `string` | — | Action name. **Must be a plain string**: it doubles as the accessible name, the tooltip, and the menu's type-ahead term. |
| icon | `ReactNode` | — | A prefix in the text form; the entire button content in the icon form. |
| tone | `"neutral" \| "brand" \| "danger"` | `"neutral"` | Hierarchy. Mark the primary action `brand` and destructive ones `danger`. |
| disabled | `boolean` | `false` | Unavailable. Still focusable, still announces its name. |
| disabledReason | `ReactNode` | — | Why it is unavailable. **If you set `disabled`, set this too.** |
| confirm | `RowActionConfirm` | — | Confirmation step: `{ title, description?, confirmText?, cancelText? }`. |
| hidden | `boolean` | `false` | Hide by permission. |
| onSelect | `() => void \| Promise<unknown>` | — | Click callback; with `confirm` it runs only after confirmation. **Returning a Promise turns on loading** (see below). |
| render | `ReactElement` | — | Render as another element, typically a router `<Link>`. |

## Examples

```tsx
// Hierarchy through tone; destructive actions get a confirm step
<RowActions
  actions={[
    { key: "view", label: "View", tone: "brand", render: <Link href={`/orders/${row.id}`} /> },
    { key: "edit", label: "Edit", onSelect: () => openEdit(row) },
    {
      key: "del",
      label: "Delete",
      tone: "danger",
      confirm: { title: "Delete this record?", description: "This cannot be undone." },
      onSelect: () => remove(row.id),
    },
  ]}
/>

// Many actions: two stay out, the rest move into the menu
<RowActions max={3} actions={[view, edit, copy, exportPdf, voidInvoice]} />

// Dense tables use the icon form
<RowActions
  variant="icon"
  actions={[
    { key: "view", label: "View", icon: <Eye className="size-4" /> },
    { key: "del", label: "Delete", tone: "danger", icon: <Trash2 className="size-4" />, confirm: { title: "Delete?" } },
  ]}
/>

// An unavailable action has to say why
{ key: "del", label: "Delete", tone: "danger", disabled: row.invoiced, disabledReason: "Invoiced rows cannot be deleted" }
```

## Motion

Action buttons (including the overflow trigger) carry the library's **press feedback**: a slight scale on press, with the duration and curve taken from the motion system's fast step, dropped automatically under `prefers-reduced-motion: reduce` -- that preference is the library's job, not something to switch off at the call site. It comes from the `Button` base (`BUTTON_BASE_CLASS`), so every `<Button>` in the library feels the same and `RowActions` adds nothing of its own.

`revealOnHover` fades on the same fast step and becomes an instant swap under reduced motion.

## Async actions

Returning a Promise from `onSelect` hands the whole cycle to the component - no `loading` or `disabled` props needed on your side:

- That action spins, and **the other actions in the row stop responding** - two writes fired from one row reach the server in essentially random order
- With `confirm`, the confirm button spins too and **the dialog closes only on success**; a failure leaves it open so the user can retry
- While it runs, Escape, the overlay and the cancel button all refuse to close: closing mid-flight tells the user they cancelled something that was never cancelled
- On rejection the component only stops the spinner and **shows no error copy** - that is business semantics, so catch it in `onSelect` and raise your own toast

```tsx
{ key: "del", label: "Delete", tone: "danger",
  confirm: { title: "Delete?" },
  onSelect: async () => {
    try { await api.remove(row.id); await mutate() }
    catch (e) { toast({ title: "Delete failed", tone: "danger" }); throw e }  // rethrow, or the dialog closes
  } }
```

## Choosing a form

| Form | Looks like | Use it when |
|---|---|---|
| `text` (default) | Borderless text | Actions are mostly read-only navigation. A row of borders chops the table up. |
| `button` | Outlined buttons | Actions actually change data. Clickability and hit area should not have to be guessed. |
| `icon` | Icons only | Dense tables where column width is tight. The name moves to the accessible name and tooltip. |

Tones are identical across the three (that is what `tone` is for), and the overflow trigger follows the form -- no borderless "..." appears among outlined buttons.

**Spacing between actions also follows the form**: 16px for `text`, 4px for `button` and `icon`. Not one constant, because the `text` form renders `variant="link"` buttons, and `link` is pinned to `px-0` inside Button (a plain text link, its left edge aligned with the column header) -- so that gap is **all** the separation two actions get. The other two forms carry horizontal padding of their own, making the visual gap `gap + 2x padding`. One shared number would squeeze the text form into a single phrase.

## Design rationale

- **Past `max`, only `max - 1` actions stay visible.** The menu trigger occupies a slot of its own, so keeping `max` buttons and adding a "..." makes `max + 1` controls and a column one slot wider than the caller expects.
- **Destructive actions sit last in the menu, behind a separator.** A menu is where a slipped click lands on whatever is under the cursor; putting Delete next to Edit invites exactly that.
- **Disabled does not use the native `disabled` attribute.** A natively disabled button is neither focusable nor a source of pointer events, so the "why is this greyed out" tooltip can never appear -- precisely when it is needed most. The component uses `aria-disabled` plus a short-circuited click, keeping the name readable, the tooltip reachable, and keyboard navigation intact.
- **The confirmation dialog lives inside the component** rather than going through the imperative `modal.confirm`. That one requires a `<ModalProvider />` mounted at the app root, and when it is missing **nothing happens at all** -- the user clicks Delete, no dialog appears, the action never runs, and the console stays silent. Row actions are the last place that should happen. Owning the dialog also means the confirmation feels identical before and after an action collapses into the menu.
- **Navigation actions go through `render`.** Driving them with `onSelect` and `router.push` throws away Cmd-click to open a new tab, middle click, and copy-link -- everyday tools for admin users, and only a real `<a>` has them.

## Usage notes

- `label` is a `string`, not a `ReactNode`, because it has to serve as the accessible name, the tooltip text, and the menu type-ahead term at once, and all three only accept strings. If you want rich text, reconsider whether the action name is too long.
- Give every entry an `icon` in the icon form; without one the button renders empty and only the accessible name remains, which is readable but not visible.
- Do not conflate `hidden` with `disabled`: **no permission means `hidden`** (the action should not be advertised), while **a state that currently forbids it means `disabled` plus `disabledReason`** (the user should learn why not right now).
- **Narrow screens do not shrink `max` automatically.** It is a fixed number: pass a smaller `max` at your own breakpoints, or switch to `variant="icon"`. Container-query auto-collapsing was deliberately left out - the actions column is sized by its content, so making the content follow that width closes a loop that proved unstable in practice.
- When every action is filtered out by `hidden` the component **renders nothing at all** (not an empty shell), so do not rely on it to hold a column open.
- Past five actions in one row, ask whether these belong in a bulk action bar or on the detail page instead of raising `max` again.

## Related
[Table](../table/table.md) · [ProTable](../pro-table/pro-table.md) · [Button](../button/button.md) · [Menu](../menu/menu.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popconfirm](../popconfirm/popconfirm.md)
