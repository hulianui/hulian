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

> Elastic slider · Rubber-band overdrag, responsive endpoint icons, spring rebound, and reduced-motion support · forms/basic · #animated

## When to use

Use ElasticSlider for an expressive, pointer-driven value such as volume or brightness. Use the standard Slider when the value belongs in a validated form, requires complete keyboard semantics, or must align with [Input](../input/input.md) and Select controls. ElasticSlider is an uncontrolled presentation component that prioritizes drag feedback over form semantics.

## Import
```ts
import { ElasticSlider } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| defaultValue | `number` | `50` | Initial value. Internal state is initialized on mount and resynchronized if this prop changes. |
| startingValue | `number` | `0` | Value at the left end of the track. |
| maxValue | `number` | `100` | Value at the right end of the track. |
| isStepped | `boolean` | `false` | Snaps dragged values to `stepSize` increments. |
| stepSize | `number` | `1` | Snap increment when `isStepped` is true. |
| showValue | `boolean` | `true` | Shows the current numeric value above the center of the track. |
| className | `string` | — | Additional class name for the root container. |
| style | `CSSProperties` | — | Inline styles for the root container. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: number) => void` | Called with each new value produced while dragging. |

## Slots

| Slot | Type | Description |
|------|------|------|
| leftIcon | `ReactNode` | Icon at the lower-value end; it shifts and scales during left-side overdrag. |
| rightIcon | `ReactNode` | Icon at the higher-value end; it shifts and scales during right-side overdrag. |

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

- **Uncontrolled:** `defaultValue` initializes internal state and resynchronizes when the prop changes. Persist `onValueChange` results if the application needs to read the current value elsewhere.
- Overdrag stretches beyond the track in both axes. Leave overflow space around the component and avoid clipping it with `overflow-hidden`.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
