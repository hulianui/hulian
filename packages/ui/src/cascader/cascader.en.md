---
slug: cascader
name: Cascader
category: forms
group: advanced
tags: []
exports: [Cascader, flattenLeafPaths, filterLeafPaths, type CascaderLeafPath]
status: enriched
---

# Cascader

> Selects a value through linked hierarchical option columns. · forms/advanced

## When to use

Use Cascader for hierarchical choices such as province/city/district, category/subcategory, or organizational levels, where the user drills down to select a complete path. Its value is an array of node `key` values from the root to the selected node. By default, only leaves can be selected; enable `changeOnSelect` to accept a node at any level. For a flat option list, use [Combobox](../combobox/combobox.md) or [Listbox](../listbox/listbox.md) instead.

## Import
```ts
import { Cascader, flattenLeafPaths, filterLeafPaths, type CascaderLeafPath } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| nodes* | `TreeNode[]` | - | Hierarchical data using the shared tree-core `TreeNode` shape: `key`, `label`, `children`, and `disabled`. |
| value | `string[]` | - | Controlled key path from the root to the selected node. |
| defaultValue | `string[]` | `[]` | Initial key path when uncontrolled. |
| expandTrigger | `"click" \| "hover"` | `"click"` | Interaction that expands the next level. |
| changeOnSelect | `boolean` | `false` | Whether a node at any level can be selected instead of leaves only. |
| showSearch | `boolean` | `false` | Shows a search field above the popup. Leaf paths are flattened for fuzzy matching, and selecting a result submits its full path. |
| searchPlaceholder | `string` | `"\u641c\u7d22\u2026"` | Search-field placeholder; the built-in Chinese copy means “Search…”. |
| placeholder | `string` | `"\u8bf7\u9009\u62e9"` | Trigger placeholder; the built-in Chinese copy means “Please select.” |
| disabled | `boolean` | - | Disables the component. |
| invalid | `boolean` | - | Applies invalid-state styling. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size. |
| className | `string` | - | Additional class name for the container. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(path: string[], nodes: TreeNode[]) => void` | Called with the selected key path and its corresponding node chain. |

## Examples
```tsx
const [value, setValue] = useState<string[]>([]);
<Cascader
  nodes={nodes}
  expandTrigger="click"
  value={value}
  onChange={(path) => setValue(path)}
/>
```

Allow selection at any level, such as a province or a city:
```tsx
<Cascader nodes={nodes} changeOnSelect value={value} onChange={(path) => setValue(path)} />
```

## Usage guidelines

- `value` is a **complete key-path array**, such as `["zhejiang","hangzhou","xihu"]`, not a single leaf key. Provide the full path when restoring a value so the expanded columns align correctly.
- A `disabled` node cannot be selected, and its subtree cannot be expanded through that node.
- The second `onChange` argument is the selected `TreeNode[]` chain. Use it to display labels instead of looking the nodes up again.
- The trigger is a `role="combobox"` button, and native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, `onBlur`, …) land on **it** rather than on the outer container, which is the element that takes focus and that screen readers announce (#293).
- Inside [Field](../field/field.md) the label's `htmlFor`, `aria-describedby`, `invalid`, and `disabled` are wired to the trigger automatically, and so is the `aria-required` injected by `<Field required>`. **That chain was broken before 0.54.0** (the label pointed at an id that did not exist, so screen readers never announced the field name); upgrading needs no call-site change.
- Query the trigger by role with `getByRole("combobox")` in tests, not `"button"` anymore.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
