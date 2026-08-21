---
slug: select
name: Select
category: forms
group: basic
tags: []
exports: [Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel]
status: enriched
---

# Select

> Dropdown selection · Base UI single or multiple selection + automatic labels from `items` + clearable, searchable, loading, and grouped states · forms/basic

## When to use

Use Select to choose one or more values from a fixed option set that is large enough to collapse into a dropdown. In multiple mode, values become `string[]`; SelectTrigger shows selected labels and folds overflow into `+N`. Use [Radio](../radio/radio.md) or [CheckboxGroup](../checkbox-group/checkbox-group.md) when a small set should remain visible, and [Input](../input/input.md) for free text. Supply `items` as `{ value, label }[]` so the trigger resolves labels instead of displaying raw values.

For users familiar with `el-select`, HulianUI's `clearable` has the same role, while `searchable` corresponds to `filterable`. Search mode reuses the Base UI Combobox implementation. Use [Combobox](../combobox/combobox.md) directly for chip-based multi-entry, asynchronous remote completion, or free-form input.

## Import
```ts
import { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel } from "@hulianui/ui"
```

## Props

`Select` inherits Base UI `Select.Root` properties such as `value`, `defaultValue`, `onValueChange`, and `disabled`, except where `items` is redefined below.

### Select
| Name | Type | Default | Description |
|------|------|------|------|
| items | `ReadonlyArray<{ value: string \| null; label: ReactNode }>` | - | Option data used by Base UI to resolve selected labels in the trigger. |
| defaultValue | `string \| string[] \| null` | `null` | Uncontrolled initial value: `string \| null` for single select, `string[]` when `multiple`. |
| placeholder | `ReactNode` | - | Content shown without a selection. Single mode injects a `value: null` item; multiple mode renders it through the trigger's functional Value. |
| multiple | `boolean` | `false` | Enables multiple selection: `value`, `defaultValue`, and `onValueChange` use `string[]`, and the popup stays open after selection. |
| clearable | `boolean` | `false` | Shows a clear action on trigger hover/focus. Clearing emits `null` in single mode or `[]` in multiple mode. |
| searchable | `boolean` | `false` | Uses the Combobox search UI and Base UI filtering; requires `items`. |
| searchPlaceholder | `string` | `"\u641c\u7d22"` | Search input placeholder; the built-in Chinese copy means “Search.” |
| emptyMessage | `ReactNode` | `"\u65e0\u5339\u914d\u9879"` | Empty state; the built-in Chinese copy means “No matching options.” |
| virtualized | `boolean` | `true` once `items` reaches 100 | Virtualizes the list under the `searchable` skin; the standard skin never virtualizes. See Usage guidelines. |
| loading | `boolean` | `false` | Replaces the trigger icon with Spinner and the option list with loading content. |
| loadingText | `ReactNode` | `"\u52a0\u8f7d\u4e2d"` | Loading-state content; the built-in Chinese copy means “Loading.” |

### SelectGroup / SelectGroupLabel
| Name | Type | Default | Description |
|------|------|------|------|
| children* | `ReactNode` | - | One `SelectGroupLabel` followed by one or more `SelectItem` elements. |
| className | `string` | - | Additional class name passed through to the element. |

### SelectTrigger
| Name | Type | Default | Description |
|------|------|------|------|
| size | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Visual size. `xs` matches the `xs` height of Input and Textarea, so the three controls line up in a dense table row. |
| invalid | `boolean` | `false` | Whether to show invalid styling when the trigger is used outside a Field. |
| maxDisplay | `number` | `2` | Maximum visible selected labels in multiple mode; remaining selections collapse into `+N`. |
| className | `string` | - | Additional class name passed through to the element. |

### SelectContent
| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top" \| "bottom"` | `"bottom"` | Side on which the popup opens. |
| align | `"start" \| "center" \| "end"` | - | Popup alignment relative to the trigger. |
| sideOffset | `number` | - | Distance between the popup and trigger. |

### SelectItem
| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | - | String value that identifies the option. |
| disabled | `boolean` | `false` | Whether to disable this option. |

## Events

`Select` forwards the common events from Base UI `Select.Root`.

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| null, eventDetails) => void` (`(value: string[], …)` in multiple mode) | Base UI `Select.Root` value-change callback. |
| onOpenChange | `(open: boolean, eventDetails) => void` | Base UI `Select.Root` open-state callback. |

## Slots

| Slot | Type | Description |
|------|------|------|
| SelectContent.children* | `ReactNode` | `SelectItem` elements, optionally nested in `SelectGroup`. |
| SelectItem.children* | `ReactNode` | Content displayed for the option. |
| SelectGroupLabel.children* | `ReactNode` | Group heading. |

## Example
```tsx
const FONTS = [
  { value: "sans", label: "Sans serif" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
];

<Select items={FONTS} placeholder="Please select a font" defaultValue="serif">
  <SelectTrigger />
  <SelectContent>
    {FONTS.map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// Multiple selection for filters such as coverage or report dimensions
const [points, setPoints] = useState<string[]>([]);

<Select items={KNOWLEDGE_POINTS} placeholder="Select topics" multiple value={points} onValueChange={setPoints}>
  <SelectTrigger maxDisplay={2} />
  <SelectContent>
    {KNOWLEDGE_POINTS.map((p) => (
      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// Clearable and searchable, corresponding to el-select's clearable and filterable options
<Select items={FONTS} placeholder="Please select a font" clearable searchable searchPlaceholder="Search font">
  <SelectTrigger />
  <SelectContent>
    {FONTS.map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// Loading options asynchronously
const { data, isLoading } = useFonts();

<Select items={data ?? []} placeholder="Please select a font" loading={isLoading}>
  <SelectTrigger />
  <SelectContent>
    {(data ?? []).map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// Option grouping
<Select items={FONTS} placeholder="Please select a font">
  <SelectTrigger />
  <SelectContent>
    <SelectGroup>
      <SelectGroupLabel>Proportional</SelectGroupLabel>
      <SelectItem value="sans">Sans serif</SelectItem>
      <SelectItem value="serif">Serif</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectGroupLabel>Code</SelectGroupLabel>
      <SelectItem value="mono">Monospace</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

## Usage guidelines

- Under `searchable`, **lists of 100 options or more are virtualized automatically** (the underlying Combobox decides): only visible options stay in the DOM, and row height is estimated at a fixed 32px without per-item measurement. The default `SelectItem` is exactly 32px tall, so most usage is unaffected. **If** your `SelectItem` is taller (two lines, an avatar, custom padding or font size), item placement drifts as the list grows. **Nothing throws, and short lists never reproduce it**. Pass `virtualized={false}` for those rows. Likewise, `getAllByRole("option")` returns only the visible window once virtualization kicks in.
- Pass placeholder content to Select's `placeholder` prop, **not** to `Select.Value`. See [[base-ui-select-rc0-no-value-placeholder-prop-inject-null-item]]: this project uses Base UI rc.0, whose `Select.Value` lacks the later placeholder prop. HulianUI implements single-mode placeholders by injecting an `items` entry with `value: null`. Keep `items` and SelectItem values aligned or the trigger falls back to raw values.
- Under `multiple`, values must be arrays; `defaultValue="a"` is treated as no selection. Multiple mode renders its placeholder through the trigger's functional Value and relies on `items` for label resolution. Without `items`, selected raw values are displayed.
- `SelectTrigger.maxDisplay`, not Select, controls the number of visible labels in multiple mode.
- `clearable` adds internal state only for uncontrolled usage. **Controlled semantics do not change:** clearing calls `onValueChange`, but the visible value changes only when the consumer writes it back.
- The clear button is a **sibling** of Trigger, positioned over the arrow area, because nesting `<button>` inside `<button>` is invalid and would also reopen the popup through bubbling. It is normally hidden and appears through `group-hover` and `group-focus-within`.
- `searchable` requires `items`. Search results are driven by that array; matching consumer-provided SelectItem content is reused by value, while items without a corresponding SelectItem render their labels. Without `items`, the popup has no candidates.
- Search mode flattens options, so declarative SelectGroup structure does not apply. Use [Combobox](../combobox/combobox.md) for combined search and grouping.
- Search matches string labels. For a JSX label such as icon plus text, it falls back to matching `value`. Use [Combobox](../combobox/combobox.md)'s `filter` for multi-field matching such as localized names, transliteration, and codes.
- For remote completion or free-form entry, use [Combobox](../combobox/combobox.md) rather than extending Select's fixed-option contract.
- During `loading`, the popup renders only loading content (never stale options) and hides the clear action while the current value may be refreshing. `loading` is a display state and never rewrites the value: unmounting the options while the popup is open makes Base UI treat the selected items as removed and emit a pruned value; the component swallows that internal callback while loading (controlled: no `onValueChange`; uncontrolled: the internal value stays), so the selection is intact once loading ends. This only covers the window bracketed by `loading`. Swapping `items` while the popup is open with a list that omits the selected item still lets Base UI emit the pruned value. For remote search keep the selected items inside `items`, or use `searchable` (the Combobox skin has no such pruning).

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
