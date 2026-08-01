---
slug: combobox
name: Combobox
category: forms
group: advanced
tags: []
exports: [Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip]
status: enriched
---

# Combobox

> Autocomplete · Trigger-button search inside an equal-width popup or direct inline input, with single- and multi-select modes · forms/advanced

## When to use

Use Combobox when a large option set must be filtered as the user types. It supports single selection, `multiple` selection with chips, a trigger button that opens a searchable popup, and direct inline input. Use [Select](../select/select.md) for a small fixed list, [SecretField](../secret-field/secret-field.md) to display an existing secret, or [Mentions](../mentions/mentions.md) for @mentions.

## Import
```ts
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip } from "@hulianui/ui"
```

## Props

`Combobox` extends Base UI `Combobox.Root<ComboboxItemData, Multiple>`; the table below lists HulianUI's common additions.

| Name | Type | Default | Description |
|------|------|------|------|
| items | `ComboboxItemData[]` | — | Option data `{value,label}`, automatically displayed with label and submitted with value |
| value | `ComboboxItemData｜ComboboxItemData[]` | — | Controlled selection (array when multiple) |
| defaultValue | Same as above | — | Uncontrolled initial selection |
| multiple | `boolean` | `false` | Changes `value` and `onValueChange` to arrays. |
| disabled | `boolean` | `false` | Disables the control. |

`ComboboxTrigger` displays the selected label or placeholder and opens search inside the popup.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | size |
| placeholder | `string` | — | Placeholder copy when not selected |
| invalid | `boolean` | `false` | Applies invalid styling when used outside Field. |
| className | `string` | — | — |

`ComboboxInput` (inline auto-completion: the field is visible in the input box itself)

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | size |
| placeholder | `string` | — | Placeholder |
| invalid | `boolean` | `false` | Applies invalid styling. |
| clearable | `boolean` | `false` | Render clear button when value is present |
| className | `string` | — | — |

`ComboboxContent`

| Name | Type | Default | Description |
|------|------|------|------|
| searchPlaceholder | `string` | — | Renders a search field at the top of the popup when used with Trigger. When omitted, Combobox uses inline completion. |
| side | `"top"｜"bottom"` | — | popup direction |
| align | `"start"｜"center"｜"end"` | — | popup alignment |
| sideOffset | `number` | — | offset |
| onListScroll | `UIEventHandler<HTMLDivElement>` | — | List scrolling callback, `e.currentTarget` is the scrolling container (used for remote paging "scroll to the end to load more", see [RemoteSelect](../remote-select/remote-select.md)) |
| footer | `ReactNode` | — | Permanent footer below the list (loading/counting/end prompt), does not scroll with the list |
| className | `string` | — | — |

`ComboboxItem`

| Name | Type | Default | Description |
|------|------|------|------|
| value * | `ComboboxItemData` | — | Option `{value,label}` object |
| disabled | `boolean` | `false` | Disable this item |
| className | `string` | — | — |

`ComboboxChips` (multi-select chips case): `size`, `invalid`, `placeholder`, `className` (plus `children` slot, see Slots).
`ComboboxChip` (single selected chip): `className` (plus `children` slot, see Slots).

## Events

`Combobox` inherits events from Base UI `Combobox.Root`.

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value) => void` | Selected change callback (when multiple, value is an array) |

## Slots

`Combobox`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Trigger or input plus popup content. |

`ComboboxContent`

| Slot | Type | Description |
|------|------|------|
| children * | `(item, index) => ReactNode` | Rendering function, List is automatically called by traversing filtered items |
| emptyMessage | `ReactNode` | No matching copy |

`ComboboxItem`

| Slot | Type | Description |
|------|------|------|
| children * | `ReactNode` | render content |

`ComboboxChips`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Contains chip column + input box |

`ComboboxChip`

| Slot | Type | Description |
|------|------|------|
| children * | `ReactNode` | chip content |

## Examples

Trigger button with search inside the popup:
```tsx
<Combobox items={FRUITS}>
  <ComboboxTrigger placeholder="Choose fruit" />
  <ComboboxContent searchPlaceholder="Search for fruits…">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

Inline auto-completion (input box is field):
```tsx
<Combobox items={FRUITS}>
  <ComboboxInput placeholder="Search for fruits…" clearable />
  <ComboboxContent>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

## Usage guidelines

- `ComboboxItem` receives the entire `{value,label}` object as `value`, not just a string. Pass `value={item}` from the render function so Base UI can derive both the label and value.
- Set `searchPlaceholder` on `ComboboxContent` when using `ComboboxTrigger` to provide search inside the popup. With `ComboboxInput`, the inline input is already the search field.
- Enabling `multiple` changes `value` and `onValueChange` to arrays. Controlled state must use the corresponding array type.
- Pass `invalid` only when Combobox is used outside Field. Field supplies invalid styling automatically for nested controls.

## Related
[SecretField](../secret-field/secret-field.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
