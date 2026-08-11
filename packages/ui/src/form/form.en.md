---
slug: form
name: Form
category: forms
group: framework
tags: []
exports: [Form, useForm, validateValue, FormList]
status: enriched
---

# Form

> Form container and controller · Structured submission, validation rules, field dependencies, server errors, and dynamic lists · forms/framework

## When to use

Use Form for a group of fields that submits structured values and owns its validation flow. `Form` collects values by native field name, `useForm` adds registration, rules, dependencies, and controlled submission, and `FormList` manages dynamic rows. Use [ModalForm / DrawerForm](../form-dialog/form-dialog.md) for overlays, [ProForm](../pro-form/pro-form.md) for an inline grid with a standard footer, or [SearchForm](../search-form/search-form.md) for list filters.

## Import
```ts
import { Form, useForm, validateValue, FormList } from "@hulianui/ui"
```

## Props

`Form`:

| Name | Type | Default | Description |
|------|------|------|------|
| validationMode | `"onSubmit" \| "onBlur" \| "onChange"` | `"onSubmit"` | Point at which validation runs. |
| errors | `Record<string, string \| string[]>` | — | External or server errors keyed by `<Field name>`. The matching Field must render `Field.Error`. |
| className | `string` | — | Additional class name for the form container. |

## Events

| Event | Type | Description |
|------|------|------|
| onFormSubmit | `(formValues: Record<string, unknown>) => void` | Called with structured values after the component prevents native form submission. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Fields and form actions. |

`useForm` controller usage (see examples for details): `form.register(name, { rules, dependencies })`, `form.submit(onValid, onInvalid)`, `form.resetFields()`.

`register()` returns `{ name, value, onChange, onBlur, error, required }`. The `required` flag is derived from whether the rules contain `required: true`; forward it to the `required` prop of [`Field`](../field/field.md) so the requirement is visible before submitting (asterisk plus `aria-required`), while the rules remain the only source of validation.

## Examples
```tsx
<Form className="w-72" onFormSubmit={(v) => console.log(v)}>
  <Field label="Email" name="email">
    <Input name="email" type="email" required />
  </Field>
  <Button type="submit" size="sm">Submit</Button>
</Form>
```
```tsx
// useForm: validation rules and field dependencies
const form = useForm({ initialValues: { pwd: "", confirm: "" } });
const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "Use at least 6 characters" }] });
const confirm = form.register("confirm", {
  dependencies: ["pwd"],
  rules: [{ validator: (v, values) => { if (v !== values.pwd) throw new Error("Passwords do not match"); } }],
});
<form onSubmit={form.submit((values) => save(values))} noValidate>
  <Field label="Password" error={pwd.error}>
    <Input type="password" value={pwd.value as string} onChange={pwd.onChange} onBlur={pwd.onBlur} />
  </Field>
  <Field label="Confirm Password" error={confirm.error}>
    <Input type="password" value={confirm.value as string} onChange={confirm.onChange} onBlur={confirm.onBlur} />
  </Field>
</form>
```

## Usage guidelines

- A `validator` reports failure with `throw new Error("...")`, not `false`. Declare linked fields in `dependencies` so validation reruns when they change.
- To display external or server `errors`, render `Field.Error` in the matching Field and make each error key exactly match `<Field name>`.
- With `useForm`, add `noValidate` to the native `<form>` so browser validation does not preempt the rule engine.

## Related
[ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
