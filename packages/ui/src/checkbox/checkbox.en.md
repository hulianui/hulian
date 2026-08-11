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
| size | `"sm" \| "md"` | `"md"` | Size step; the box and its built-in check scale together. `md` is 20px/14px/`text-sm`, `sm` is 16px/12px/`text-xs`, matching `size="sm"` on Input and SelectTrigger. |
| className | `string` | — | Additional class name for `Checkbox.Root` (the box); it cannot reach the label text. |
| labelClassName | `string` | — | Applied to the label `<span>` for font size and color. |
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
- Wrapping the Checkbox in your own `<label>` **does work**, so there is no need to forward `onClick` by hand. The Root renders as `<span role="checkbox">` — not a labelable element — so the DOM makes implicit association look broken, but Base UI keeps a visually hidden native input inside to carry activation, and clicking the text still toggles. Use this when the typography is too specific for `size` plus `labelClassName`.
- Do not add `<label htmlFor>` pointing at the Root `id` while also wrapping: an explicit `htmlFor` **overrides** that implicit association, and having both means clicking the text does nothing at all. Wrap, or use `htmlFor` — not both.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
