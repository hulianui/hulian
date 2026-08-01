---
slug: toggle
name: Toggle
category: forms
group: basic
tags: []
exports: [Toggle, ToggleGroup, toggleVariants]
status: enriched
---

# Toggle

> Toggle button · Base UI pressed state + ToggleGroup single/multiple selection · forms/basic

## When to use

Use Toggle for an icon or text button with a persistent pressed state, such as Bold, alignment, or an AI toolbar mode. ToggleGroup coordinates mutually exclusive or multiple pressed items. Use [Switch](../switch/switch.md) for an immediately applied setting, or [Radio](../radio/radio.md) for a conventional group of equivalent form choices.

## Import
```ts
import { Toggle, ToggleGroup, toggleVariants } from "@hulianui/ui"
```

## Props

`Toggle`

| Name | Type | Default | Description |
|------|------|------|------|
| pressed | `boolean` | — | controlled pressed state |
| defaultPressed | `boolean` | `false` | Uncontrolled initial press state |
| disabled | `boolean` | `false` | Disable |
| value | `string` | — | Identifies the item within the ToggleGroup |
| variant | `"default"｜"outline"｜"pill"` | `"default"` | default=grey background soft selection / outline=main color solid / pill=rounded stroke + soft main color selection (AI toolbar switch style) |
| size | `"sm"｜"md"` | `"md"` | — |
| className | `string` | — | — |
| aria-label | `string` | — | Required if only icon |

`ToggleGroup`

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string[]` | — | Controlled: item value array has been pressed |
| defaultValue | `string[]` | — | Uncontrolled initial item-by-item array |
| disabled | `boolean` | `false` | Disable entire group |
| multiple | `boolean` | `false` | true=multiple selections coexist; false=single selections are mutually exclusive |
| orientation | `"horizontal"｜"vertical"` | `"horizontal"` | — |
| className | `string` | — | — |

## Events

`Toggle`

| Event | Type | Description |
|------|------|------|
| onPressedChange | `(pressed: boolean) => void` | Pressed state change (Hulian converges signature, loses Base UI eventDetails) |

`ToggleGroup`

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string[]) => void` | change callback |

## Slots

`Toggle`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | icon / text |

`ToggleGroup`

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Item `Toggle` is included |

## Example

Single toggle (controlled):
```tsx
const [on, setOn] = useState(false);
<Toggle pressed={on} onPressedChange={setOn} aria-label="Bold">
  <Bold className="size-4" />
</Toggle>
```

Mutually exclusive radio group:
```tsx
<ToggleGroup defaultValue={["center"]}>
  <Toggle value="left" aria-label="Align left"><AlignLeft className="size-4" /></Toggle>
  <Toggle value="center" aria-label="Align center"><AlignCenter className="size-4" /></Toggle>
  <Toggle value="right" aria-label="Align right"><AlignRight className="size-4" /></Toggle>
</ToggleGroup>
```

## Usage guidelines

- ToggleGroup always represents pressed items as a value array; with `multiple={false}`, the array contains zero or one value.
- An icon-only Toggle needs `aria-label` so screen readers can identify the action.
- Controlled usage requires `pressed`/`onPressedChange`, or group `value`/`onValueChange`. Use `defaultPressed` or `defaultValue` only when uncontrolled.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
