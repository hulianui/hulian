---
slug: checkbox
name: Checkbox
category: forms
group: basic
tags: []
exports: [Checkbox]
status: enriched
---

# Checkbox

> Checkbox · Checked, unchecked, and indeterminate states with Base UI · forms/basic

## When to use

Use Checkbox for a single Boolean choice such as accepting terms or remembering a login, or for a Select All control with an `indeterminate` state. Wrap coordinated options in [CheckboxGroup](../checkbox-group/checkbox-group.md) to manage them as a value array. Use [Switch](../switch/switch.md) for an immediate on/off setting or [Radio](../radio/radio.md) for mutually exclusive choices.

## Import
```ts
import { Checkbox } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| checked | `boolean` | — | Controlled checked state. |
| defaultChecked | `boolean` | — | Initial checked state when uncontrolled. |
| indeterminate | `boolean` | `false` | Third, partially checked state provided by Base UI. |
| disabled | `boolean` | `false` | Disables the checkbox. |
| required | `boolean` | `false` | Marks the checkbox as required. |
| name | `string` | — | Form field name. |
| value | `string` | — | Form value and the member key used by CheckboxGroup. |
| id | `string` | — | ID associated with the label. |
| className | `string` | — | Additional class name for `Checkbox.Root`. |
| tabIndex | `number` | — | Passed to `Checkbox.Root`. Set `-1` in a tree when a roving-focus container owns keyboard focus. |
| aria-label | `string` | — | Accessible label when no visible label is provided. |

## Events

| Event | Type | Description |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | Called when checked state changes. HulianUI normalizes the signature and omits `eventDetails`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Inline label rendered to the right with a native `<label>` association. |
| children | `ReactNode` | Equivalent to `label`: `<Checkbox>I agree</Checkbox>`. When both are given, `label` wins. |

## Examples
```tsx
<Checkbox defaultChecked label="Remember me" />
```
```tsx
{/* Resolve a controlled indeterminate state */}
<Checkbox
  checked={checked}
  indeterminate={indeterminate}
  onCheckedChange={(c) => { setChecked(c); setIndeterminate(false); }}
/>
```

## Usage guidelines

- Inside [CheckboxGroup](../checkbox-group/checkbox-group.md), every Checkbox must provide `value`, not `name`. See [[base-ui-checkbox-group-matches-members-by-value-not-name]]: Base UI rc.0 matches group members by `value`; using `name` makes `defaultValue`, `value`, and `onValueChange` fail silently even though the boxes render.
- `indeterminate` is an independent third state. After the user clicks, usually resolve it explicitly with `setIndeterminate(false)`.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
