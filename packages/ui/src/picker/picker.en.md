---
slug: picker
name: Picker
category: mobile
group: input
tags: []
exports: [Picker]
status: enriched
---

# Picker

> Wheel picker · Multi-column CSS scroll snapping + immediate centered-item highlight + debounced change events + controlled positioning (zero dependencies · mobile time/region selection) · mobile/input

## When to Use

Use it on mobile to select one or more columns of discrete values, such as hour and minute or province, city, and district, with an iOS-style wheel interaction. Use [ActionSheet](../action-sheet/action-sheet.md) for a simple list of actions; Picker is commonly placed inside an action sheet or bottom drawer.

## Import
```ts
import { Picker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `columns` * | `PickerColumn[]` | — | Configuration of each column (see below) |
| `value` | `string[]` | — | Array of selected values in each column (controlled) |
| `defaultValue` | `string[]` | First item in each column | Initial value in uncontrolled mode |
| `visibleCount` | `number` | `5` | Number of visible lines (odd number recommended) |
| `itemHeight` | `number` | `40` | row height px |
| `className` | `string` | — | — |

**PickerColumn**: `options: PickerOption[]` · `flex?: number` (column flex ratio, default 1).
**PickerOption**: `label: ReactNode` · `value: string`.

## Events

| Event | Type | Description |
|------|------|------|
| `onChange` | `(value: string[], columnIndex: number) => void` | Called after a column settles, with the complete value array and changed column index |

## Examples
```tsx
const [val, setVal] = useState(["9", "30"]);

<Picker columns={[hours, minutes]} value={val} onChange={setVal} />
```

## Usage Guidelines
- `value` / `defaultValue` is a **string array**, each item corresponds to a column, and the value must match a `value` of the `options` in the column; the number of columns is consistent with the length of `columns`.
- `onChange` fires only after scrolling settles and includes the changed column index. Highlighting and centering update immediately, but the callback is not emitted on every frame.

## Related
[TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
