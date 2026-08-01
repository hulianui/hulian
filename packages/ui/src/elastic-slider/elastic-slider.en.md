---
slug: elastic-slider
name: ElasticSlider
category: forms
group: basic
tags: [animated]
exports: [ElasticSlider]
status: enriched
---

# ElasticSlider

> Elastic slider · Rubber-band overdrag, reactive endpoint icons, hover enlargement, spring rebound, and reduced-motion support · forms/basic · #animated

## When to use

Use ElasticSlider for an expressive single value such as volume or brightness. For validated form input, full keyboard semantics, and alignment with [Input](../input/input.md) or Select, use the standard Slider instead. ElasticSlider is an uncontrolled decorative control that prioritizes drag feel over form semantics.

## Import
```ts
import { ElasticSlider } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| defaultValue | `number` | `50` | Initial value (uncontrolled). The component maintains internal values and only synchronizes the internal state when mounting and the prop changes. |
| startingValue | `number` | `0` | Lower bound of measurement range (corresponding value on the leftmost side of the track) |
| maxValue | `number` | `100` | Upper bound of measurement range (corresponding value on the rightmost side of the track) |
| isStepped | `boolean` | `false` | Snaps dragged values to `stepSize` increments. |
| stepSize | `number` | `1` | Snap increment when `isStepped` is true. |
| showValue | `boolean` | `true` | Whether to display a digital indication of the current value (centered above the track) |
| className | `string` | — | supports additional className to the root container (merge via cn) |
| style | `CSSProperties` | — | supports inline styles to the root container |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: number) => void` | Called back when dragging generates a new value for the consumer to take over/report the value |

## Slots

| Slot | Type | Description |
|------|------|------|
| leftIcon | `ReactNode` | The icon on the left (left end of the track), when dragging crosses the boundary to the far left, it will move and zoom in with the rebound. |
| rightIcon | `ReactNode` | The icon on the right (right end of the track), when dragging crosses the boundary to the far right, it will move and zoom in with the rebound. |

## Examples
```tsx
// Default volume slider
<ElasticSlider defaultValue={40} />
```
```tsx
// Custom icons, range, and step snapping
<ElasticSlider
  defaultValue={65}
  startingValue={-50}
  maxValue={50}
  isStepped
  stepSize={10}
  leftIcon={<SunDim className="size-5" aria-hidden />}
  rightIcon={<Sun className="size-5" aria-hidden />}
/>
```

## Usage guidelines

- **Uncontrolled:** `defaultValue` initializes internal state and resynchronizes only when the prop changes. It is not a controlled value; store updates from `onValueChange` if the application needs them.
- Overdrag stretches beyond the track in both axes. Leave overflow space around the component and avoid clipping it with `overflow-hidden`.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
