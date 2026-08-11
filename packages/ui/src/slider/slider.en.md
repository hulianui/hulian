---
slug: slider
name: Slider
category: forms
group: basic
tags: []
exports: [Slider]
status: enriched
---

# Slider

> Slider · Base UI single value/range + keyboard step · forms/basic

## When to use

Use Slider when users should drag to choose a value or range, such as volume, price, or percentage, and approximate magnitude matters more than exact entry. Use [NumberField](../number-field/number-field.md) for precise numbers with step buttons, or [Segmented](../segmented/segmented.md) for a small discrete set.

## Import
```ts
import { Slider } from "@hulianui/ui"
```

## Props

Accepts Base UI `Slider.Root` props except `render` and `children`. A numeric `value` creates a single thumb; an array creates a range automatically.

| Name | Type | Default | Description |
|------|------|------|------|
| value | `number\|readonly number[]` | — | Controlled value; an array represents a range. |
| defaultValue | `number\|readonly number[]` | — | Initial value when uncontrolled. |
| min | `number` | `0` | minimum value |
| max | `number` | `100` | maximum value |
| step | `number` | `1` | step amount |
| disabled | `boolean` | `false` | Disable |
| showValue | `boolean` | `false` | Shows the current `Slider.Value` above the track. |
| thumbAriaLabel | `string \| [string, string]` | — | Accessible name for the thumb. Falls back to the Root `aria-label`; pass a two-item tuple to name each thumb of a range separately. |
| className | `string` | — | Root wrapper className |

> The remaining props of Base UI `Slider.Root` (`name`, `orientation`, etc.) are transparently transmitted as they are.

## Events

Common Base UI `Slider.Root` events are passed through with their upstream signatures.

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: number\|number[], eventDetails) => void` | Value change callback (pass number for single value, number[] for range) |
| onValueCommitted | `(value: number\|number[], eventDetails) => void` | Callback when dragging ends/submits |

## Example
```tsx
<Slider defaultValue={60} showValue className="w-64" />
```

Range:
```tsx
<Slider defaultValue={[25, 75]} showValue className="w-64" />
```

## Usage guidelines

- Pass a `number` for one thumb and `number[]` for a range; there is no separate range prop.
- Set `showValue` to display the numeric readout; it is hidden by default.
- `className` applies to the Root wrapper. Supply a width such as `w-64`, or the slider may collapse to its content width.
- **`aria-label` lands somewhere else than you wrote it**: on a single-value slider it moves to the thumb (the visually hidden `<input type="range">`) instead of staying on the Root. The Root is a `role="group"`, and a name there leaves screen readers announcing just “slider, 100” once focus reaches the control. Since the group holds exactly one control this is a move rather than a copy — duplicating the name would have it announced twice and would make name-based queries such as `getByLabelText` match two elements. A range keeps the group name; use `thumbAriaLabel` with a two-item tuple there, or both thumbs sound identical.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
