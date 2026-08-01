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

> Segmented control · radio semantics with arrow-key navigation + CSS-variable sliding indicator · dependency-free · forms/basic

## When to use

Use Segmented for two to five mutually exclusive horizontal choices, such as Day/Week/Month, Grid/List/Map, or Monthly/Annual. An indicator highlights the active item and selection is one string value. Use [Radio](../radio/radio.md) for vertically arranged form choices, Tabs for switching page-level panels, or [Select](../select/select.md) for a larger collapsed set.

## Import
```ts
import { Segmented } from "@hulianui/ui"
```

## Props

`Segmented`

| Name | Type | Default | Description |
|------|------|------|------|
| items * | `SegmentedItem[]` | — | segment definition array |
| value | `string` | — | controlled selected value |
| defaultValue | `string` | First non-disabled segment | Uncontrolled initial selection value |
| disabled | `boolean` | `false` | Disable overall |
| size | `"sm"｜"md"` | `"md"` | — |
| className | `string` | — | — |
| aria-label | `string` | — | Provided when no title is visible |

`SegmentedItem`

| Name | Type | Default | Description |
|------|------|------|------|
| value * | `string` | — | The unique value of this segment (also the selected identifier) |
| ariaLabel | `string` | — | Label is required when it is a rich node (icon/logo), otherwise it will be downgraded to value. |
| disabled | `boolean` | `false` | Single segment disabled |

## Events

`Segmented`

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Selected changes (single value, radio semantics mutually exclusive) |

## Slots

`SegmentedItem`

| Slot | Type | Description |
|------|------|------|
| label * | `ReactNode` | paragraph content (text or icon) |

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

Icon segments (one for each ariaLabel):
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
