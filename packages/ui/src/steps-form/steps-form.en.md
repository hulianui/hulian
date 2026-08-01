---
slug: steps-form
name: StepsForm
category: forms
group: framework
tags: []
exports: [StepsForm]
status: enriched
---

# StepsForm

> Multistep form · Steps indicator + Previous/Next/Submit navigation + per-step `onStepValidate` + consumer-owned form state + localized copy · forms/framework

## When to use

Use StepsForm for guided flows such as registration, account setup, or data import when a long form should be divided and validated step by step. [Form](../form/form.md) and [ProForm](../pro-form/pro-form.md) show all fields and submit once; StepsForm renders only the current step. Field values remain in the consumer's useForm instance because StepsForm does not own form state.

## Import
```ts
import { StepsForm } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| steps* | `StepsFormStep[]` | — | Step array, each item contains `title`/`description`/`content`/`nextDisabled`/`nextText`/`showNav` |
| current | `number` | — | Controlled current step (from 0) |
| defaultCurrent | `number` | — | uncontrolled initial step |
| direction | `"horizontal" \| "vertical"` | — | Steps indicator direction |
| className | `string` | — | Root node class name |

## Events

| Event | Type | Description |
|------|------|------|
| onCurrentChange | `(current: number) => void` | step change callback |
| onStepValidate | `(currentStep: number) => boolean \| Promise<boolean>` | Runs before leaving a step. Return false or reject to block navigation; async work keeps the forward button loading. |
| onFinish | `() => void \| Promise<void>` | Called when submitting the final step; a Promise enables submit-button loading. |

`StepsFormStep` field: `title: ReactNode` (required), `description?`, `content: ReactNode` (required, only rendered in the current step), `nextDisabled?` (default false, prohibit this step from advancing), `nextText?` (this step forward button copy, default to locale), `showNav?` (default When true or false, the bottom navigation of this step will not be rendered and is used for the built-in operation of the result step).

## Example
```tsx
const form = useForm({ initialValues: { name: "", company: "" } });
const name = form.register("name", { rules: [{ required: true, message: "Please enter name" }] });

<StepsForm
  onStepValidate={async (step) => {
    if (step === 0) return (await form.validateField("name")) == null;
    return true;
  }}
  onFinish={async () => {
    const r = await form.validate();
    if (r.ok) await api.save(r.values);
  }}
  steps={[
    { title: "Basic information", content: (
        <Field label="Name" error={name.error}>
          <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} />
        </Field>
      ) },
    { title: "Company information", content: <Field label="Company">{/* ... */}</Field> },
  ]}
/>
```

## Usage guidelines

- StepsForm **does not own field values**. Keep them in the consumer's `useForm` or unmounted step content will lose local input state. In `onStepValidate`, validate only the current step with `form.validateField`; a full `form.validate()` would reject empty future fields.
- Pair controlled `current` with `onCurrentChange`, or navigation cannot advance.
- For a result step with its own actions such as “Start again,” set `showNav: false` to hide built-in navigation.

## Related
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
