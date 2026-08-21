---
slug: transfer
name: Transfer
category: forms
group: advanced
tags: []
exports: [Transfer]
status: enriched
---

# Transfer

> Moves selected records between available and chosen lists with search support. · forms/advanced

## When to use

Use Transfer to move permissions, visible fields, allowlist entries, or similar items from a complete source set into a target set while keeping both sides visible and searchable. It is clearer than a multiple [Listbox](../listbox/listbox.md) for dozens or hundreds of candidates that must be compared in batches. Use Listbox `multiple` when one column is enough.

## Import
```ts
import { Transfer } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| dataSource* | `TransferItem[]` | - | Full data source; each item `key`/`label`, can bring `description`/`disabled` |
| targetKeys | `string[]` | - | Controlled: Set of keys for the right (target) panel |
| defaultTargetKeys | `string[]` | `[]` | Uncontrolled initial target keys. |
| searchable | `boolean` | `false` | Show search box at top of each panel |
| searchPlaceholder | `string` | `"\u641c\u7d22"` | Search input placeholder; the built-in Chinese copy means “Search.” |
| filterOption | `(input: string, item: TransferItem) => boolean` | label contains matches | Custom filtering (default case-insensitive substring) |
| listHeight | `number` | `240` | The maximum height of the panel list area (px). If you have hundreds of node permissions/department data, increase it, otherwise the panel will be squeezed into a gap. |
| showSelectAll | `boolean` | `false` | The panel title bar displays the Select All checkbox (only applies to **available items in the current filter results**) |
| disabled | `boolean` | `false` | Disabled overall (lists and move buttons on both sides are disabled) |
| className | `string` | - | Container class name |

`TransferItem`

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | - | Unique key, also the value used by `targetKeys`. |
| label * | `ReactNode` | - | Primary text of the entry. |
| description | `ReactNode` | - | Secondary description shown under the label. |
| disabled | `boolean` | `false` | The entry cannot be selected or moved. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(targetKeys: string[], direction: "left" \| "right", movedKeys: string[]) => void` | Callback after the move, `direction` is `"right"` (selected)/`"left"` (removed) |

## Slots

| Slot | Type | Description |
|------|------|------|
| titles | `[ReactNode, ReactNode]` | Source and target panel titles; the default is `["\u6e90\u5217\u8868", "\u5df2\u9009"]`, built-in Chinese copy meaning “Source list” and “Selected.” |

## Example
```tsx
const [target, setTarget] = useState<string[]>(["dashboard", "orders"]);
<Transfer
  dataSource={modules}
  targetKeys={target}
  onChange={setTarget}
  titles={["All modules", "Authorized"]}
  searchable
/>
```

## Usage guidelines

- The first `onChange` argument is the complete target-key set after movement, so it may be passed directly to `setTarget`; do not merge `movedKeys` manually. `direction` and `movedKeys` support audits or change summaries.
- Disabled items cannot be selected or moved by the Move All actions, allowing historical entries to remain frozen.
- Select All with `showSelectAll` covers only enabled items in the **current filtered result**. If search shows three of 200 items, only those three are selected; clear the query before selecting the full set.
- Panel lists are not virtualized. For thousands of items, use `listHeight` and scrolling; at tens of thousands, group or lazy-load data before passing it to Transfer.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
