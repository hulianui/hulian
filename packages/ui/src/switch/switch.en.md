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

> Switches · Base UI controlled + ARIA · forms/basic

## When to use

Toggle a Boolean switch that takes effect immediately (such as "Turn on notifications"). Use it when changes are applied immediately and no submit button is required. Use [Radio](../radio/radio.md) to choose between two mutually exclusive options that are semantically equivalent; use [Checkbox](../checkbox/checkbox.md) to check a Boolean item (such as "Agree to the Terms") when submitting the form.

## Import
```ts
import { Switch } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| checked | `boolean` | — | controlled switching state |
| defaultChecked | `boolean` | `false` | uncontrolled initial state |
| disabled | `boolean` | `false` | Disable |
| id | `string` | — | — |
| className | `string` | — | — |
| aria-label | `string` | — | Provided when no title is visible |
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | Visual size (Track 36×20 / 40×24 / 48×28). `md` is consistent pixel by pixel before adding this prop. |
| touchTarget | `boolean` | `false` | Expand an invisible ≥44px hit area (only affects hits, does not occupy the layout, and does not change the vision). It is recommended to open the mobile version |

## Events

| Event | Type | Description |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | Switch change callback |

## Example
```tsx
<Switch defaultChecked aria-label="Turn on notifications" />
```

controlled:
```tsx
const [on, setOn] = useState(false);
<Switch checked={on} onCheckedChange={setOn} aria-label="Turn on notifications" />
```

## Usage guidelines

- Pair controlled `checked` with `onCheckedChange`. Use `defaultChecked` only for uncontrolled initial state; do not mix the two patterns.
- When there is no visible title, be sure to give `aria-label`, otherwise the screen will read without a name.
- **Enable `touchTarget` on mobile.** The default `md` track is only 24 px high, below the recommended 44 px touch target; the invisible expansion improves finger accuracy without changing layout.
- The expanded hit area extends about 10 px above and below. In a dense desktop form it may overlap nearby controls, so the option is off by default and should be enabled by context.

## Related
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
