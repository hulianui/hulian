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

> Edits numeric values with bounds, step buttons, and keyboard stepping. · forms/basic

## When to use

Use NumberField for precise numeric input with increment/decrement buttons and `min`/`max` bounds, such as quantities or thresholds. Use [Slider](../slider/slider.md) for approximate values selected by dragging, or [Input](../input/input.md) for arbitrary text.

## Import
```ts
import { NumberField } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `number\|null` | - | Controlled value; `null` represents empty. |
| defaultValue | `number\|null` | - | Initial value when uncontrolled; `null` starts empty, matching `value`. |
| min | `number` | - | Minimum value. |
| max | `number` | - | Maximum value. |
| step | `number` | `1` | Increment or decrement amount. |
| disabled | `boolean` | `false` | Disables interaction. |
| readOnly | `boolean` | `false` | Makes the field read-only. |
| required | `boolean` | - | Marks the native form field as required. |
| name | `string` | - | Native form name |
| id | `string` | - | - |
| className | `string` | - | - |
| aria-label | `string` | - | Provided when no title is visible |

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

- The controlled type is `number | null`: clearing emits `null`, so use state such as `useState<number | null>` instead of assuming a number is always present. **The reverse direction holds too**: passing `null` into `value` (or `defaultValue`) renders an empty string with the placeholder visible rather than `0`, and `min={0}` does not clamp it to 0. Tri-state fields (`null` / `0` / a positive number) such as "leave empty to inherit the default" versus "explicitly zero" can therefore be expressed with this component, and the two stay distinguishable on screen.
- Controlled usage requires both `value` and `onValueChange`. For uncontrolled usage, provide only `defaultValue`.
- **Values outside the signature are treated as empty rather than falling to `0`** (#220). `value` only accepts `number | null`, yet controlled values often arrive through type-erased paths (`register().value` from `useForm` is `unknown`, an API payload is `any`), so an empty string can slip in - and the underlying control renders that as `0`, the worst possible landing spot for a tri-state field ("left blank" and "explicitly zero" are opposite business conclusions that then look identical on screen). Such values are now treated as empty, with one `warnOnce` in development naming the source. `undefined` is excluded: that means uncontrolled and is passed through untouched.
- Provide `aria-label` when there is no visible label so screen readers can identify the field.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
