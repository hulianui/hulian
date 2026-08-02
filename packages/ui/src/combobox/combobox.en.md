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

> Autocomplete · Search in an equal-width popup or directly in the field · Single and multiple selection · forms/advanced

## When to use

Use Combobox when users need to filter a substantial option set as they type. It supports a trigger that opens a searchable popup, an inline autocomplete field, and chip-based multiple selection. Use [Select](../select/select.md) for a small fixed list, [SecretField](../secret-field/secret-field.md) to display an existing secret, or [Mentions](../mentions/mentions.md) for inline references such as @mentions.

## Import
```ts
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip } from "@hulianui/ui"
```

## Props

`Combobox` extends Base UI `Combobox.Root<ComboboxItemData, Multiple>`; the table below lists HulianUI's common additions.

| Name | Type | Default | Description |
|------|------|------|------|
| items | `ComboboxItemData[]` | — | Options in `{ value, label }` form. The label is displayed while the value identifies the option. |
| value | `ComboboxItemData\|ComboboxItemData[]` | — | Controlled selection; use an array when `multiple` is true. |
| defaultValue | Same as above | — | Initial selection when uncontrolled. |
| multiple | `boolean` | `false` | Changes `value` and `onValueChange` to arrays. |
| disabled | `boolean` | `false` | Disables the control. |

`ComboboxTrigger` displays the selected label or placeholder and opens the searchable popup.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"\|"md"\|"lg"` | `"md"` | Trigger size. |
| placeholder | `string` | — | Text shown when nothing is selected. |
| invalid | `boolean` | `false` | Applies invalid styling when used outside Field. |
| className | `string` | — | Additional class name for the trigger. |

`ComboboxInput` provides inline autocomplete: the visible field is also the search input.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"\|"md"\|"lg"` | `"md"` | Input size. |
| placeholder | `string` | — | Input placeholder. |
| invalid | `boolean` | `false` | Applies invalid styling. |
| clearable | `boolean` | `false` | Shows a clear button when the field has a value. |
| className | `string` | — | Additional class name for the input. |

`ComboboxContent`

| Name | Type | Default | Description |
|------|------|------|------|
| searchPlaceholder | `string` | — | Adds a search field to the popup when used with `ComboboxTrigger`. Omit it when `ComboboxInput` already provides inline search. |
| side | `"top"\|"bottom"` | — | Preferred side of the trigger on which to place the popup. |
| align | `"start"\|"center"\|"end"` | — | Popup alignment relative to the trigger. |
| sideOffset | `number` | — | Distance from the trigger in pixels. |
| onListScroll | `UIEventHandler<HTMLDivElement>` | — | Called when the option list scrolls. `e.currentTarget` is the scroll container, which can be inspected to implement load-on-scroll pagination; see [RemoteSelect](../remote-select/remote-select.md). |
| footer | `ReactNode` | — | Fixed content below the scrolling list, such as loading, count, or end-of-results feedback. |
| className | `string` | — | Additional class name for the popup. |

`ComboboxItem`

| Name | Type | Default | Description |
|------|------|------|------|
| value * | `ComboboxItemData` | — | Complete `{ value, label }` option object. |
| disabled | `boolean` | `false` | Disables this option. |
| className | `string` | — | Additional class name for the option. |

`ComboboxChips` is the multiple-selection field shell and accepts `size`, `invalid`, `placeholder`, `className`, and `children`.
`ComboboxChip` renders one selected value and accepts `className` and `children`.

## Events

`Combobox` inherits events from Base UI `Combobox.Root`.

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value) => void` | Called when the selection changes; `value` is an array in multiple mode. |

## Slots

`Combobox`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Trigger or input plus popup content. |

`ComboboxContent`

| Slot | Type | Description |
|------|------|------|
| children * | `(item, index) => ReactNode` | Render function invoked once for each filtered option. |
| emptyMessage | `ReactNode` | Content shown when no option matches the query. |

`ComboboxItem`

| Slot | Type | Description |
|------|------|------|
| children * | `ReactNode` | Visible option content. |

`ComboboxChips`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Selected chips and the inline input. |

`ComboboxChip`

| Slot | Type | Description |
|------|------|------|
| children * | `ReactNode` | Visible chip content. |

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

Inline autocomplete, where the field itself accepts the search query:
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
