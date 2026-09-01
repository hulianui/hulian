---
slug: checkbox-group
name: CheckboxGroup
category: forms
group: basic
tags: []
exports: [CheckboxGroup]
status: enriched
---

# CheckboxGroup

> Coordinates an array of values across a group of checkboxes. · forms/basic

## When to use

Use CheckboxGroup when related checkboxes should share a value array, such as multi-select filters or interest tags. Use [Checkbox](../checkbox/checkbox.md) for one independent Boolean choice, [Radio](../radio/radio.md) for mutually exclusive options, or [Select](../select/select.md) for dropdown multi-selection. Children are HulianUI [Checkbox](../checkbox/checkbox.md) components with a `value`; the group matches members by that value.

## Import
```ts
import { CheckboxGroup } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string[]` | - | Controlled array of checked values. |
| defaultValue | `string[]` | - | Initial checked values when uncontrolled. |
| disabled | `boolean` | `false` | Disables every checkbox in the group. |
| orientation | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction. |
| className | `string` | - | Additional class name for the root element. |
| aria-label | `string` | - | Accessible label for the group. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string[]) => void` | Called when the checked values change. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | HulianUI Checkbox children, each with a `value`. |

## Examples
```tsx
<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" label="Apple" />
  <Checkbox value="banana" label="Banana" />
  <Checkbox value="cherry" label="Cherry" />
</CheckboxGroup>
```
```tsx
{/* Controlled */}
const [v, setV] = useState<string[]>(["apple"]);
<CheckboxGroup value={v} onValueChange={setV} orientation="horizontal">
  <Checkbox value="apple" label="Apple" />
  <Checkbox value="banana" label="Banana" />
</CheckboxGroup>
```

## Usage guidelines

- Every child Checkbox must provide `value`, not `name`. See [[base-ui-checkbox-group-matches-members-by-value-not-name]]: Base UI rc.0 matches group members by each child's `value`. Using `name` makes `defaultValue`, `value`, and `onValueChange` fail silently even though the boxes still render.
- Inside a `Field`, each child Checkbox is named by **its own** `label`; the `Field` label names the group (role=group), and description / error still reach every item. No need to wrap items in Base UI `Field.Item` yourself.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
