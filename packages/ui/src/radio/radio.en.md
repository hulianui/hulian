---
slug: radio
name: Radio
category: forms
group: basic
tags: []
exports: [RadioGroup, Radio]
status: enriched
---

# Radio

> Mutually exclusive selection · RadioGroup + arrow-key navigation · forms/basic

## When to use

Use Radio when exactly one choice must be selected from a small set—typically two to six—and every option should remain visible. Use [Select](../select/select.md) when a larger set should collapse or support search, [CheckboxGroup](../checkbox-group/checkbox-group.md) when several choices may coexist, or [Segmented](../segmented/segmented.md) for two or three compact horizontal choices with a sliding indicator.

## Import
```ts
import { RadioGroup, Radio } from "@hulianui/ui"
```

## Props

`RadioGroup`

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | — | Controlled selected value. |
| defaultValue | `string` | — | Initial selected value when uncontrolled. |
| disabled | `boolean` | `false` | Disables the entire group. |
| required | `boolean` | — | Marks the native form control as required. |
| name | `string` | — | Native form name |
| orientation | `"vertical"\|"horizontal"` | `"vertical"` | Controls layout only. |
| className | `string` | — | — |
| aria-label | `string` | — | Provided when no title is visible |

`Radio`

| Name | Type | Default | Description |
|------|------|------|------|
| value * | `string` | — | Required value identifying the option. |
| disabled | `boolean` | `false` | Disables this option. |
| id | `string` | — | — |
| className | `string` | — | Applied to `Radio.Root`. |
| aria-label | `string` | — | Accessible name. **Required when `label` is omitted or contains only visual content such as an icon.** |
| aria-labelledby | `string` | — | ID of an existing element used as the accessible name; use instead of `aria-label`. |
| aria-describedby | `string` | — | ID of supplementary descriptive text for the option. |

## Events

`RadioGroup`

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Called when selection changes. |

## Slots

`RadioGroup`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Radio items in the group. |

`Radio`

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Optional clickable inline label with native `<label>` association. |

## Example
```tsx
<RadioGroup defaultValue="b" aria-label="Options">
  <Radio value="a" label="Option one" />
  <Radio value="b" label="Option two" />
  <Radio value="c" label="Option three (disabled)" disabled />
</RadioGroup>
```

Horizontal and controlled:
```tsx
const [value, setValue] = useState("standard");
<RadioGroup value={value} onValueChange={setValue} orientation="horizontal" aria-label="Plan">
  <Radio value="standard" label="Standard" />
  <Radio value="pro" label="Pro" />
</RadioGroup>
```

## Usage guidelines

- `RadioGroup` owns selection; individual Radio items do not expose a separate `checked` state.
- Controlled usage requires `value` and `onValueChange`. Use `defaultValue` only for uncontrolled initial state; do not mix the two patterns.
- Give a group without a visible heading an `aria-label` so screen readers can identify its purpose.
- **A Radio without a textual `label` must provide `aria-label` or `aria-labelledby`.** This includes icon cards and custom layouts; otherwise assistive technology announces only “radio button” without identifying the choice.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Switch](../switch/switch.md)
