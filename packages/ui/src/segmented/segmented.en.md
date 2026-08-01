---
slug: segmented
name: Segmented
category: forms
group: basic
tags: []
exports: [Segmented]
status: enriched
---

# Segmented

> Segmented control with radio semantics, arrow-key navigation, and a CSS-variable sliding indicator · dependency-free · forms/basic

## When to use

Use Segmented for two to five mutually exclusive horizontal choices, such as Day/Week/Month, Grid/List/Map, or Monthly/Annual. An indicator highlights the active item, and the selected value is a single string. Use [Radio](../radio/radio.md) for vertically arranged form choices, Tabs for switching page-level panels, or [Select](../select/select.md) for a larger collapsed set.

## Import
```ts
import { Segmented } from "@hulianui/ui"
```

## Props

`Segmented`

| Name | Type | Default | Description |
|------|------|------|------|
| items * | `SegmentedItem[]` | — | Definitions for the available segments. |
| value | `string` | — | Selected value in controlled mode. |
| defaultValue | `string` | First non-disabled segment | Initial selected value in uncontrolled mode. |
| disabled | `boolean` | `false` | Whether to disable the entire control. |
| size | `"sm"｜"md"` | `"md"` | Visual size. |
| className | `string` | — | Additional class name for the root element. |
| aria-label | `string` | — | Accessible label for the control when no visible title is present. |

`SegmentedItem`

| Name | Type | Default | Description |
|------|------|------|------|
| value * | `string` | — | Unique value that identifies the segment and its selected state. |
| ariaLabel | `string` | — | Accessible label for non-text content such as an icon or logo; otherwise screen readers fall back to `value`. |
| disabled | `boolean` | `false` | Whether to disable this segment. |

## Events

`Segmented`

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Called with the newly selected value; selection is mutually exclusive. |

## Slots

`SegmentedItem`

| Slot | Type | Description |
|------|------|------|
| label * | `ReactNode` | Segment content, such as text or an icon. |

## Example
```tsx
<Segmented
  items={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ]}
  defaultValue="week"
  aria-label="Period"
/>
```

Icon-only segments, each with its own `ariaLabel`:
```tsx
<Segmented
  items={[
    { value: "grid", ariaLabel: "Grid view", label: <LayoutGrid className="size-4" /> },
    { value: "list", ariaLabel: "List view", label: <List className="size-4" /> },
  ]}
  defaultValue="grid"
  aria-label="View"
/>
```

## Usage guidelines

- When `label` is an icon, logo, or other non-text node, provide `ariaLabel`; otherwise screen readers fall back to the raw `value`.
- Controlled usage requires `value` and `onValueChange`. For uncontrolled state, provide only `defaultValue`.
- Segmented is single-select only. Use [ToggleGroup](../toggle/toggle.md) when several items may remain active.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
