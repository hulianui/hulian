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
| virtualized | `boolean` | `true` once `items` reaches 100 | Virtualizes the list so only visible options are rendered. Decided from the option count when omitted — see Usage guidelines. |
| disabled | `boolean` | `false` | Disables the control. |

`ComboboxTrigger` displays the selected label or placeholder and opens the searchable popup. It extends the native `<button>` attributes, and remaining attributes land on the button itself.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"\|"md"\|"lg"` | `"md"` | Trigger size. |
| placeholder | `string` | — | Text shown when nothing is selected. A button has no native placeholder, so this is a HulianUI prop. |
| invalid | `boolean` | `false` | Applies invalid styling when used outside Field. |
| className | `string` | — | Additional class name for the trigger. |

`ComboboxInput` provides inline autocomplete: the visible field is also the search input. It extends the native `<input>` attributes, and remaining attributes land on the **inner `<input>`** rather than the shell span — see Usage guidelines.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"\|"md"\|"lg"` | `"md"` | Input size. |
| placeholder | `string` | — | Input placeholder; a native attribute forwarded to the inner input. |
| invalid | `boolean` | `false` | Applies invalid styling. |
| clearable | `boolean` | `false` | Shows a clear button when the field has a value. |
| prefix | `ReactNode` | — | Leading icon slot, matching `Input.prefix`. Use a magnifier for search fields. |
| showChevron | `boolean` | `true` | Trailing expand chevron. Pass `false` for a search field. |
| className | `string` | — | Class name for the shell, which carries the field styling and is not forwarded to the input. |

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

`ComboboxChips` is the multiple-selection field shell and accepts `size`, `invalid`, `placeholder`, `className`, and `children`. It extends the native `<input>` attributes, and remaining attributes land on the **inner `<input>`** because the chips container is only the visual shell.
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

A search field, where the field itself is the search box rather than the popup:
```tsx
<Combobox items={TASKS}>
  <ComboboxInput
    size="sm"
    prefix={<SearchIcon />}
    showChevron={false}
    placeholder="Search tasks, clients, files"
    aria-label="Search tasks, clients, files"
  />
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

- **Lists of 100 options or more are virtualized automatically** — you do not pass `virtualized` yourself. Only the visible options stay in the DOM, and row height is **estimated at a fixed 32px without per-item measurement**. The default `ComboboxItem` is exactly 32px tall, so most usage is unaffected. **If** your render function returns rows of a different height (two lines of text, an avatar, custom padding or font size through `className`), scrollbar length and item placement drift apart as the list grows — **nothing throws, and short lists never reproduce it**; the jump only shows once you scroll past the first screens. Pass `virtualized={false}` for those rows, or make them 32px tall.
- Virtualization also affects **tests and scripts that assume every option is in the DOM**: `getAllByRole("option")` returns only the visible window, and `document.querySelector` cannot find options you have not scrolled to. Assert totals against `data-hulian-virtual-count` on the list container, or pass `virtualized={false}` for that test.
- Components built on Combobox inherit this: the `searchable` skin of [Select](../select/select.md) and the candidate list of [RemoteSelect](../remote-select/remote-select.md) both virtualize once they hold 100 options.
- `ComboboxItem` receives the entire `{value,label}` object as `value`, not just a string. Pass `value={item}` from the render function so Base UI can derive both the label and value.
- Set `searchPlaceholder` on `ComboboxContent` when using `ComboboxTrigger` to provide search inside the popup. With `ComboboxInput`, the inline input is already the search field.
- Enabling `multiple` changes `value` and `onValueChange` to arrays. Controlled state must use the corresponding array type.
- Pass `invalid` only when Combobox is used outside Field. Field supplies invalid styling automatically for nested controls.
- **Remaining native attributes on `ComboboxInput` and `ComboboxChips` land on the inner `<input>`, not on the shell.** The `role="combobox"`, focusability, and form ownership all live on that input, so `aria-label`, `id`, `name`, and `onBlur` have no effect on the shell span or the chips container. Outside [Field](../field/field.md), `<ComboboxInput aria-label="Search tasks" />` is therefore enough — no wrapping `<label>` with an `.sr-only` span — and `field.onBlur` from a react-hook-form `Controller` can be passed directly. Use `className` for hooks on the outer container. `ComboboxTrigger` has no shell, so its remaining attributes land on the button itself.
- Styling and `data-invalid` supplied by the component cannot be overridden: `rest` is spread first, following the library-wide contract in section 7 of `docs/consuming.md`. Passing `aria-invalid={false}` does not clear the styling applied by `invalid`.
- A search field needs **both** `prefix` and `showChevron={false}`. Adding only the magnifier leaves the chevron in place, which still reads as a dropdown. Search inside the popup is a different pattern: `searchPlaceholder` on `ComboboxContent` renders its own search field with a built-in magnifier, and `ComboboxInput` is not involved.

## Related
[SecretField](../secret-field/secret-field.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
