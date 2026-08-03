---
slug: number-field
name: NumberField
category: forms
group: basic
tags: []
exports: [NumberField]
status: enriched
---

# NumberField

> Numeric stepping · Base UI ± buttons + keyboard stepping + min/max · forms/basic

## When to use

Use NumberField for precise numeric input with increment/decrement buttons and `min`/`max` bounds, such as quantities or thresholds. Use [Slider](../slider/slider.md) for approximate values selected by dragging, or [Input](../input/input.md) for arbitrary text.

## Import
```ts
import { NumberField } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `number\|null` | — | Controlled value; `null` represents empty. |
| defaultValue | `number` | — | Initial value when uncontrolled. |
| min | `number` | — | Minimum value. |
| max | `number` | — | Maximum value. |
| step | `number` | `1` | Increment or decrement amount. |
| disabled | `boolean` | `false` | Disables interaction. |
| readOnly | `boolean` | `false` | Makes the field read-only. |
| required | `boolean` | — | Marks the native form field as required. |
| name | `string` | — | Native form name |
| id | `string` | — | — |
| className | `string` | — | — |
| aria-label | `string` | — | Provided when no title is visible |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: number\|null) => void` | Called with the new value. HulianUI intentionally omits Base UI's `eventDetails`. |

## Example
```tsx
<NumberField aria-label="Quantity" defaultValue={3} min={0} max={5} />
```

Controlled (value can be null):
```tsx
const [v, setV] = useState<number | null>(2);
<NumberField aria-label="Quantity" value={v} onValueChange={setV} min={0} max={10} />
```

## Usage guidelines

- The controlled type is `number | null`: clearing emits `null`, so use state such as `useState<number | null>` instead of assuming a number is always present.
- Controlled usage requires both `value` and `onValueChange`. For uncontrolled usage, provide only `defaultValue`.
- Provide `aria-label` when there is no visible label so screen readers can identify the field.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
