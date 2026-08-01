---
slug: tree-select
name: TreeSelect
category: forms
group: advanced
tags: []
exports: [TreeSelect]
status: enriched
---

# TreeSelect

> Tree selector · trigger + Popover-hosted Tree + single or cascading multiple selection + in-tree search · shared tree engine · forms/advanced

## When to use

Use TreeSelect to choose one or more nodes from a hierarchy such as an organization, category tree, or region while keeping the field collapsed. Use [Combobox](../combobox/combobox.md) or [Listbox](../listbox/listbox.md) for flat options, or [RegionCascader](../region-cascader/region-cascader.md) for China's built-in province/city hierarchy.

## Import
```ts
import { TreeSelect } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| nodes* | `TreeNode[]` | — | Tree data source (including key/label/children), reused from `../tree/tree-core` |
| value | `string \| string[]` | — | Controlled value; single selection is string, multiple selection is string[] |
| defaultValue | `string \| string[]` | — | uncontrolled initial value |
| multiple | `boolean` | `false` | Multiple selection (checkable, parent-child cascade check) |
| placeholder | `string` | — | Trigger placeholder copy |
| disabled | `boolean` | `false` | Disable |
| invalid | `boolean` | `false` | Invalid state (the shell becomes danger) |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size |
| clearable | `boolean` | `false` | Clearable: When there is a value and is not disabled, the hover/focus popup clear button on the right side of the trigger, click to return to the unselected state (single selection returns `""`, multi-selection returns `[]`). Same semantics as `clearable` of [Select](../select/select.md) |
| searchable | `boolean` | `false` | Tree search box in floating layer, multi-layer hit jump |
| showLine | `boolean` | — | Show tree connection lines |
| className | `string` | — | Passthrough to trigger |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(value: string \| string[]) => void` | Select change callback; single selection returns string, multiple selection returns string[] |

## Example
```tsx
// Single selection with search
const [v, setV] = useState<string | string[]>("");
<TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="Select a department" searchable />

// Multiple selection cascades parent checks to leaves and derives half-checked parents
const [v, setV] = useState<string | string[]>(["fe-web", "fe-mini"]);
<TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="Check visible departments" />

// Clearable: as a filter dimension that can be left blank (leave blank = no limit)
const [dept, setDept] = useState<string | string[]>("");
<TreeSelect nodes={NODES} clearable value={dept} onChange={setDept} placeholder="All departments" />
```

## Usage guidelines

- Single selection is not clearable by default. Enable `clearable` for optional filters; otherwise users can narrow the filter but cannot return it to “no restriction.”
- Switching `multiple` changes controlled `value` and `onChange` between `string` and `string[]`. Branch state by the active mode rather than storing both shapes together.
- In multiple mode, pass selected leaf keys only. Half-checked parent state is derived from the tree; do not insert those parent keys manually.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
