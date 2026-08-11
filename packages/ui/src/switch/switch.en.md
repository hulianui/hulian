---
slug: switch
name: Switch
category: forms
group: basic
tags: []
exports: [Switch]
status: enriched
---

# Switch

> Accessible switch control built on Base UI · controlled and uncontrolled state · forms/basic

## When to use

Use Switch for a Boolean setting that takes effect immediately, such as enabling notifications, without waiting for form submission. Use [Radio](../radio/radio.md) for two mutually exclusive choices with equal semantic weight, or [Checkbox](../checkbox/checkbox.md) for a Boolean field submitted with a form, such as accepting terms.

## Import
```ts
import { Switch } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| checked | `boolean` | — | Checked state in controlled mode. |
| defaultChecked | `boolean` | `false` | Initial checked state in uncontrolled mode. |
| disabled | `boolean` | `false` | Whether to disable the switch. |
| id | `string` | — | HTML identifier used to associate the switch with a label. |
| className | `string` | — | Additional class name for the switch root. |
| aria-label | `string` | — | Accessible label when no visible label is present. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Visual size: 36×20, 40×24, or 48×28 px. The default `md` size preserves the original dimensions. |
| touchTarget | `boolean` | `false` | Expands the invisible hit area to at least 44 px without changing layout or appearance; enable it for touch interfaces when spacing permits. |

## Events

| Event | Type | Description |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | Called with the new checked state. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Inline label rendered to the right of the track with a native `<label>` association. Supplying it makes `aria-label` unnecessary. |
| children | `ReactNode` | Equivalent to `label`: `<Switch checked={v}>Enabled</Switch>`. When both are given, `label` wins. |

## Example
```tsx
<Switch defaultChecked aria-label="Turn on notifications" />
```

Controlled usage:
```tsx
const [on, setOn] = useState(false);
<Switch checked={on} onCheckedChange={setOn} aria-label="Turn on notifications" />
```

## Usage guidelines

- Pair controlled `checked` with `onCheckedChange`. Use `defaultChecked` only for uncontrolled initial state; do not mix the two patterns.
- Provide `aria-label` when there is no visible label so assistive technology can identify the control.
- **Enable `touchTarget` on mobile.** The default `md` track is only 24 px high, below the recommended 44 px touch target; the invisible expansion improves finger accuracy without changing layout.
- The expanded hit area extends about 10 px above and below. In a dense desktop form it may overlap nearby controls, so the option is off by default and should be enabled by context.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
