---
slug: filter-chip
name: FilterChip
category: data-display
group: info
tags: []
exports: [FilterChip, FilterChipGroup]
status: enriched
---

# FilterChip

> FilterChip · applied filter pill split into subject, operator, value, and remove segments · data-display/info

## When to use

Use it above a list to echo which filters are currently applied, one pill per condition, with an X that drops that condition. This is the read-back half of filtering; the input half is [SearchForm](../search-form/search-form.md), and the two usually sit together on top of [ProTable](../pro-table/pro-table.md).

For a single removable token (a skill tag, a recipient) use [Chip](../chip/chip.md); for a bare status marker use [Tag](../tag/tag.md). The difference is structure: subject, operator, and value are separate segments with their own weight and divider, so pushing them into the single `children` slot of Chip degrades them into one long sentence.

## Import
```ts
import { FilterChip, FilterChipGroup } from "@hulianui/ui"
```

## Props

### FilterChip

| Name | Type | Default | Description |
|------|------|------|------|
| subject * | `ReactNode` | — | The filtered field name. First segment, heaviest weight. |
| operator | `ReactNode` | — | The operator, such as "is any of" or "before". **Omitting it drops that segment** instead of leaving an empty slot. |
| value * | `ReactNode` | — | The value. Takes a node rather than a string, see "Rich value nodes" below. |
| size | `"sm"\|"md"` | `md` | Changes height, font size, and segment padding only; the structure stays the same. |
| subjectLabel | `string` | — | Plain-text subject used in the remove button name. Taken from `subject` automatically when it is a string; required when `subject` is a node, otherwise the name falls back to a generic "Remove filter". |
| isDisabled | `boolean` | — | Lowers opacity, blocks pointer events, and disables both buttons. |
| className | `string` | — | Root class. |

### FilterChipGroup

| Name | Type | Default | Description |
|------|------|------|------|
| clearAllLabel | `ReactNode` | locale "Clear all" | Overrides the trailing button copy. |
| aria-label | `string` | locale "Applied filters" | Overrides the accessible name of the group. |
| className | `string` | — | Root class. |
| children | `ReactNode` | — | The FilterChip list. **The whole row renders nothing when there are none**, including the clear-all button. |

## Events

| Event | Type | Description |
|------|------|------|
| onRemove | `() => void` | Adds the trailing remove (X) button and handles it. Without it there is no X: the component does not own the condition list, the caller decides what removal means. |
| onClick | `() => void` | Turns the body (subject, operator, value) into a button, typically to reopen the matching filter menu. Without it the body is plain, non-focusable content. |
| onClearAll | `() => void` | FilterChipGroup: adds the trailing clear-all text button and handles it. |

## Slots

| Slot | Type | Description |
|------|------|------|
| subject | `ReactNode` | Subject segment; may hold an icon plus text. |
| operator | `ReactNode` | Operator segment; omitting it drops both the segment and its divider. |
| value | `ReactNode` | Value segment; usually stacked avatars or status icons plus a "2 selected" summary. |

## Clicking X never fires onClick

The remove button is a **sibling** of the body button, not a descendant, so a click on the X cannot bubble into the body and consumers never need their own `stopPropagation`. It also keeps the markup free of nested buttons. Passing both `onClick` and `onRemove` is the intended usage.

## Rich value nodes

`value` takes a `ReactNode` rather than a `string` because a real filter read-back is usually up to three overlapping avatars or status icons followed by a short "2 selected" summary. The value segment itself is `flex items-center gap-1`, so several nodes can be dropped in side by side.

Note that the pill is only 24px (`sm`) or 28px (`md`) tall, while the smallest [Avatar](../avatar/avatar.md) step, `size="sm"`, is 32px and will burst the pill; use your own small nodes for avatars inside the value segment.

## Accessibility

- The remove button carries the subject in its name ("Remove filter: Status"), otherwise five pills in a row read as five identically named "Remove" buttons. When `subject` is a node, `subjectLabel` supplies that plain text.
- FilterChipGroup is a `role="group"` named "Applied filters" by default, overridable with `aria-label`.
- All copy goes through the `locale` of [ConfigProvider](../config/config.md); a custom locale predating the `filterChip` entry keeps the built-in defaults.

## Examples
```tsx
// Three segments: subject | operator | value | X
<FilterChip
  subject="Status"
  operator="is any of"
  value="2 selected"
  onRemove={() => remove("status")}
/>

// Two segments: operator omitted
<FilterChip subject="Owner" value="Alice" onRemove={() => remove("owner")} />

// A row plus clear-all; the body reopens the filter menu, the X drops one condition
<FilterChipGroup onClearAll={() => setConditions([])}>
  {conditions.map((c) => (
    <FilterChip
      key={c.id}
      subject={c.subject}
      operator={c.operator}
      value={c.value}
      onClick={() => openFilterMenu(c.id)}
      onRemove={() => setConditions((s) => s.filter((x) => x.id !== c.id))}
    />
  ))}
</FilterChipGroup>
```
