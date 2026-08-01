---
slug: listbox
name: Listbox
category: forms
group: advanced
tags: []
exports: [Listbox]
status: enriched
---

# Listbox

> Selectable list · WAI-ARIA roving tabindex + single, multiple, or action-only modes + dependency-free typeahead · forms/advanced

## When to use

Use Listbox for an always-visible, keyboard-accessible collection of options such as settings, commands, or menu items. Use `selectionMode="single"` or `"multiple"` when selection state matters, and `selectionMode="none"` with `onAction` for commands that should not remain selected. Unlike [Combobox](../combobox/combobox.md), Listbox has no input or popup and is best for a modest, flat set of visible options.

## Import
```ts
import { Listbox } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `ListboxItemData[]` | — | List items; each item contains `key`/`label`, and can contain `description`/`startContent`/`endContent`/`disabled` |
| selectionMode | `"none" \| "single" \| "multiple"` | `"single"` | `none` creates an action-only list; `single` and `multiple` retain selection. |
| selectedKeys | `string[]` | — | Controlled selected keys. |
| defaultSelectedKeys | `string[]` | `[]` | Initial selected keys when uncontrolled. |
| disabledKeys | `string[]` | `[]` | Extra disabled keys, merged with `item.disabled`. |
| className | `string` | — | Container class name |
| style | `CSSProperties` | — | Inline styles, placed on the root element of the list. Used to express dynamic values that cannot be given by the Tailwind class (such as `maxHeight` determined at runtime) |
| aria-label | `string` | `"\u9009\u9879\u5217\u8868"` | Accessible name; the built-in Chinese copy means “Option list.” |

## Events

| Event | Type | Description |
|------|------|------|
| onSelectionChange | `(keys: string[]) => void` | Called when selection changes. |
| onAction | `(key: string) => void` | Triggered when any item is activated (including none mode), used for imperative actions |

## Example
```tsx
const [keys, setKeys] = useState<string[]>(["profile"]);
<Listbox
  items={items}
  selectionMode="single"
  selectedKeys={keys}
  onSelectionChange={setKeys}
/>
```

Action-only list (no selected state):
```tsx
<Listbox items={items} selectionMode="none" onAction={(key) => run(key)} aria-label="Actions" />
```

## Usage guidelines

- With `selectionMode="none"`, the component retains no selection. Handle activations with `onAction`; `onSelectionChange` has no meaningful value in this mode.
- Provide `aria-label` when the list has no visible heading so assistive technology can identify its purpose.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
