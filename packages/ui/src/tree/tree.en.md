---
slug: tree
name: Tree
category: data-display
group: collection
tags: []
exports: [Tree, buildIndex, flattenVisible, getNodePath, toggleChecked, getCheckState, normalizeCheckedToLeaves, computeChecked, filterTree, nodeSearchText, canDropOn, isDescendant, resolveDropPosition, type FlatRow, type TreeIndex, type CheckState]
status: enriched
---

# Tree

> Renders expandable hierarchical nodes with selection and keyboard navigation. · data-display/collection

## When to use

Use Tree for a file hierarchy, organization, category navigation, or permission selection. Use [List](../list/list.md) for flat entries or [JsonViewer](../json-viewer/json-viewer.md) for read-only JSON. Tree provides keyboard-complete WAI-ARIA behavior and cascading check state.

## Import
```ts
import { Tree, buildIndex, flattenVisible, getNodePath, toggleChecked, getCheckState, normalizeCheckedToLeaves, computeChecked, filterTree, nodeSearchText, canDropOn, isDescendant, resolveDropPosition, type FlatRow, type TreeIndex, type CheckState } from "@hulianui/ui"
```

## Props

`TreeProps`:

| Name | Type | Default | Description |
|------|------|------|------|
| nodes* | `TreeNode[]` | - | `{ key, label, icon?, children?, disabled?, searchText? }` hierarchy. |
| expandedKeys | `string[]` | - | Controlled expanded keys. |
| defaultExpandedKeys | `string[]` | - | Initial uncontrolled expanded keys. |
| selectable | `boolean` | `true` | Enables single selection outside checkable mode. |
| selectedKeys | `string[]` | - | Controlled selected keys. |
| defaultSelectedKeys | `string[]` | - | Initial uncontrolled selected keys. |
| checkable | `boolean` | `false` | Adds cascading checkboxes. |
| checkedKeys | `string[]` | - | Controlled checked keys. |
| defaultCheckedKeys | `string[]` | - | Initial uncontrolled checked keys. |
| expandTrigger | `"row" \| "icon"` | `"row"` | Row expands parents without selecting them; icon reserves row clicks for selection or checking. |
| draggable | `boolean` | `false` | Enables native HTML drag sorting only when `onDrop` is supplied. |
| allowDropInside | `(target: TreeNode) => boolean` | Always true | Controls whether a target accepts reparenting inside it. |
| virtual | `boolean \| { height?, itemHeight?, overscan? }` | `false` | Flat virtual rendering, defaulting to height 320, itemHeight 36, and overscan 8. |
| showLine | `boolean` | `false` | Shows connector lines; ignored by virtual rendering. |
| searchable | `boolean` | `false` | Shows built-in tree search. |
| searchPlaceholder | `string` | locale | Search input placeholder; an explicit value overrides the locale. |
| className | `string` | - | Root class name. |
| aria-label | `string` | locale | Accessible tree label; an explicit value overrides the locale. |

## Events

| Event | Type | Description |
|------|------|------|
| onExpandedChange | `(keys: string[]) => void` | Expanded-key change. |
| onSelect | `(keys: string[], node: TreeNode) => void` | Selection change. |
| onDrop | `(e: { dragKey, dropKey, position }) => void` | Reports before, after, or inside drop semantics. |
| onCheck | `(info: { checkedKeys: string[]; halfCheckedKeys: string[] }, node: TreeNode) => void` | Reports fully checked and half-checked keys separately. |

## Examples
```tsx
<Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]} />

<Tree nodes={NODES} checkable searchable searchPlaceholder="Search components"
  onCheck={({ checkedKeys, halfCheckedKeys }) => save(checkedKeys)} />
```

## Usage notes

- Expansion, selection, and checking each independently follow controlled-or-uncontrolled symmetry. Pair a controlled key prop with its callback.
- In checkable mode, half-checked parents are returned separately and never appear in `checkedKeys`.
- Every node needs a stable key.
- `disabled` prevents selection and checking but intentionally does not block expansion, preserving access to descendants.
- With the default row expansion trigger, parents do not invoke `onSelect`. Choose `expandTrigger="icon"` when folders or categories must be selectable.
- Dragging never mutates `nodes`. Apply the returned relative position yourself. Self drops, descendant cycles, and no-op inside drops are rejected.
- Virtual mode removes nested transitions and connector lines. `itemHeight` must match real fixed row height; do not virtualize wrapping labels.
- ReactNode labels need `searchText`; otherwise search and typeahead fall back to matching the key.
- The default tree label, search placeholder, and empty-result message follow `ConfigProvider` (`zhCN` / `enUS`). Explicit `aria-label` and `searchPlaceholder` props win. Legacy custom locales without `components.tree` keep the Chinese fallback.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
