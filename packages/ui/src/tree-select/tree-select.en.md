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
| nodes* | `TreeNode[]` | - | Hierarchical data with `key`, `label`, and optional `children`, using the shared Tree node model. |
| value | `string \| string[]` | - | Controlled value: a string in single mode or `string[]` in multiple mode. |
| defaultValue | `string \| string[]` | - | Initial value in uncontrolled mode. |
| multiple | `boolean` | `false` | Whether to enable checkbox-based multiple selection with parent-child cascading. |
| placeholder | `string` | `"\u8bf7\u9009\u62e9"` | Trigger placeholder; the built-in Chinese copy means “Please select.” |
| disabled | `boolean` | `false` | Whether to disable the selector. |
| invalid | `boolean` | `false` | Applies invalid styling. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size. |
| clearable | `boolean` | `false` | Whether to reveal a clear button on trigger hover or focus when a value exists. Clearing emits `""` in single mode or `[]` in multiple mode, matching [Select](../select/select.md). |
| searchable | `boolean` | `false` | Shows a search field in the popup and expands matching paths. |
| expandTrigger | `"row" \| "icon"` | `"row"` | What toggles expand/collapse, forwarded to the inner [Tree](../tree/tree.md). **With the `"row"` default, single selection can only reach leaf nodes.** Pass `"icon"` to select an intermediate level (a department, a top-level category, one volume): the arrow expands, the rest of the row selects. |
| showLine | `boolean` | `false` | Shows tree connection lines. |
| virtual | `boolean \| { height?, itemHeight?, overscan? }` | `false` | Virtual scrolling, passed through to the inner [Tree](../tree/tree.md). Textbook outlines and org trees with tens of thousands of nodes are more common inside a collapsed picker than in an always-visible tree, and without this they all sit in the DOM. Tree then supplies its own fixed-height scroll container (`height` defaults to 320px); mutually exclusive with `showLine`. |
| className | `string` | - | Additional class name passed to the trigger. |
| popupClassName | `string` | - | Class name for the popup. Width and height limits are already provided by the component; this is the escape hatch for one-off cases. |

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
- **Single selection only reaches leaves by default.** `expandTrigger` defaults to `"row"`, so clicking a row that has children only expands it and never fires `onChange`. No number of clicks will select it. Pass `expandTrigger="icon"` to submit any level (arrow expands, row selects), or use [Cascader](../cascader/cascader.md) with `changeOnSelect`. Multiple mode is unaffected because the checkbox is its own hit area.
- In multiple mode, pass selected leaf keys only. Half-checked parent state is derived from the tree; do not insert those parent keys manually.
- **The popup width is pinned by the trigger and the viewport, not by the data**: the lower bound is the trigger width (`--anchor-width`) and the upper bound is `min(32rem, available width)`. Through 0.67.0 only the lower bound existed, so the popup was as wide as **the longest label in the whole tree** - `truncate` on a row does nothing while its container has no upper bound, and collapsed subtrees still count toward the intrinsic width (they are in the DOM, only squeezed to zero height), so one long node name nobody ever expanded could push the popup wider than the viewport (#359). Pinning it to the viewport alone is not enough: a 288px trigger with a 203-character node name still produced a 1270px popup covering half the page, so the cap is also 32rem, keeping the popup at the scale of its trigger. Wide fields are not squeezed - in CSS min-width always beats max-width. Long names now ellipsise as intended; use `popupClassName` when one particular popup really needs to be wider or narrower.
- The trigger is a `role="combobox"` button, and native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, `onBlur`, …) land on **it** rather than on the outer container, which is the element that takes focus and that screen readers announce (#293).
- Inside [Field](../field/field.md) the label's `htmlFor`, `aria-describedby`, `invalid`, and `disabled` are wired to the trigger automatically, and so is the `aria-required` injected by `<Field required>`. **That chain was broken before 0.54.0** (the label pointed at an id that did not exist, so screen readers never announced the field name); upgrading needs no call-site change.
- Query the trigger by role with `getByRole("combobox")` in tests, not `"button"` anymore.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
