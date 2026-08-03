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
| nodes* | `TreeNode[]` | — | Hierarchical data with `key`, `label`, and optional `children`, using the shared Tree node model. |
| value | `string \| string[]` | — | Controlled value: a string in single mode or `string[]` in multiple mode. |
| defaultValue | `string \| string[]` | — | Initial value in uncontrolled mode. |
| multiple | `boolean` | `false` | Whether to enable checkbox-based multiple selection with parent-child cascading. |
| placeholder | `string` | `"\u8bf7\u9009\u62e9"` | Trigger placeholder; the built-in Chinese copy means “Please select.” |
| disabled | `boolean` | `false` | Whether to disable the selector. |
| invalid | `boolean` | `false` | Applies invalid styling. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size. |
| clearable | `boolean` | `false` | Whether to reveal a clear button on trigger hover or focus when a value exists. Clearing emits `""` in single mode or `[]` in multiple mode, matching [Select](../select/select.md). |
| searchable | `boolean` | `false` | Shows a search field in the popup and expands matching paths. |
| expandTrigger | `"row" \| "icon"` | `"row"` | What toggles expand/collapse, forwarded to the inner [Tree](../tree/tree.md). **With the `"row"` default, single selection can only reach leaf nodes.** Pass `"icon"` to select an intermediate level (a department, a top-level category, one volume): the arrow expands, the rest of the row selects. |
| showLine | `boolean` | `false` | Shows tree connection lines. |
| className | `string` | — | Additional class name passed to the trigger. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(value: string \| string[]) => void` | Called with a string in single mode or `string[]` in multiple mode when selection changes. |

## Example
```tsx
// Single selection with search
const [v, setV] = useState<string | string[]>("");
<TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="Select a department" searchable />

// Multiple selection cascades parent checks to leaves and derives half-checked parents
const [v, setV] = useState<string | string[]>(["fe-web", "fe-mini"]);
<TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="Check visible departments" />

// Clearable optional filter: an empty value means no restriction
const [dept, setDept] = useState<string | string[]>("");
<TreeSelect nodes={NODES} clearable value={dept} onChange={setDept} placeholder="All departments" />
```

## Usage guidelines

- Single selection is not clearable by default. Enable `clearable` for optional filters; otherwise users can narrow the filter but cannot return it to “no restriction.”
- Switching `multiple` changes controlled `value` and `onChange` between `string` and `string[]`. Branch state by the active mode rather than storing both shapes together.
- **Single selection only reaches leaves by default.** `expandTrigger` defaults to `"row"`, so clicking a row that has children only expands it and never fires `onChange` — no number of clicks will select it. Pass `expandTrigger="icon"` to submit any level (arrow expands, row selects), or use [Cascader](../cascader/cascader.md) with `changeOnSelect`. Multiple mode is unaffected because the checkbox is its own hit area.
- In multiple mode, pass selected leaf keys only. Half-checked parent state is derived from the tree; do not insert those parent keys manually.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
