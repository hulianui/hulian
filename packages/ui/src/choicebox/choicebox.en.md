---
slug: choicebox
name: Choicebox
category: forms
group: advanced
tags: []
exports: [ChoiceboxGroup, Choicebox]
status: enriched
---

# Choicebox

> Card selector · ChoiceboxGroup and Choicebox cards with title, description, and icon; radio or checkbox semantics; controlled/uncontrolled state; and configurable grid columns · forms/advanced

## When to use

Use Choicebox when each option needs a card with a title, description, and icon, such as a subscription plan, payment method, or theme level. Use ordinary Radio or Checkbox for a single line of text, or [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md) for color swatches.

## Import
```ts
import { ChoiceboxGroup, Choicebox } from "@hulianui/ui"
```

## Props

### ChoiceboxGroup

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| string[]` | — | Controlled value: `string` for single selection and `string[]` for multiple selection. |
| defaultValue | `string \| string[]` | — | Initial value when uncontrolled. |
| multiple | `boolean` | `false` | Enables checkbox-style multiple selection; otherwise the group uses radio semantics. |
| name | `string` | Automatically generated | Radio-group name in single-select mode. |
| columns | `number` | `1` | Number of grid columns |
| disabled | `boolean` | `false` | Disables the entire group. |
| className | `string` | — | Additional class name for the container. |
| aria-label | `string` | — | Accessible label. |

### Choicebox

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | — | Option value, unique within the group. |
| disabled | `boolean` | `false` | Disables this option. |
| className | `string` | — | Additional class name for the card. |

## Events

### ChoiceboxGroup

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| string[]) => void` | Called with a `string` in single-select mode or `string[]` in multiple-select mode. |

## Slots

### ChoiceboxGroup

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | A set of Choicebox options. |

### Choicebox

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Primary title. |
| description | `ReactNode` | Supporting description. |
| icon | `ReactNode` | Leading icon. |
| children | `ReactNode` | Additional content beyond the title/description (price, tags, etc.) |

## Examples
```tsx
// Single choice package card (controlled)
const [v, setV] = useState<string | string[]>("pro");
<ChoiceboxGroup value={v} onValueChange={setV} aria-label="Subscription package">
  <Choicebox value="free" icon={<Zap />} title="Basic" description="Personal projects · Free forever">
    <div className="mt-1 font-semibold">¥0</div>
  </Choicebox>
  <Choicebox value="pro" icon={<Rocket />} title="Pro" description="Small teams · All components included" />
</ChoiceboxGroup>

// Multiple selection in a two-column grid
<ChoiceboxGroup multiple columns={2} defaultValue={["a"]}>
  <Choicebox value="a" title="Option A" description="…" />
  <Choicebox value="b" title="Option B" description="…" />
</ChoiceboxGroup>
```

## Usage guidelines

- Keep the `value` and `defaultValue` type aligned with `multiple`: use `string` for single selection and `string[]` for multiple selection. Mixing them produces inconsistent selection state.
- Interactive controls inside Choicebox `children`, such as delete or action buttons, conflict with the card-wide selection target. Stop event propagation from the nested control, or position it outside the radio/checkbox hit area.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
