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

> Form container · Base UI structured submission, name-keyed errors, Field integration, validation, dependencies, and dynamic lists · forms/framework

## When to use

Use Form to arrange `Field` controls and manage submission and validation. `Form` collects structured values by native field name; `useForm` adds rules, dependencies, registration, and submission control; `FormList` manages dynamic rows. Use [ModalForm / DrawerForm](../form-dialog/form-dialog.md) for overlays, [ProForm](../pro-form/pro-form.md) for an inline form with grid and footer, or [SearchForm](../search-form/search-form.md) for query filters.

## Import
```ts
import { Form, useForm, validateValue, FormList } from "@hulianui/ui"
```

## Props

`Form`：

| Name | Type | Default | Description |
|------|------|------|------|
| validationMode | `"onSubmit" \| "onBlur" \| "onChange"` | `"onSubmit"` | Verification timing |
| errors | `Record<string, string \| string[]>` | — | External/server verification error, mapped according to `<Field name>` (display requires Field.Error in Field) |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onFormSubmit | `(formValues: Record<string, unknown>) => void` | Get structured values when submitting (preventDefault native submission) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Field content |

`useForm` controller usage (see examples for details): `form.register(name, { rules, dependencies })`, `form.submit(onValid, onInvalid)`, `form.resetFields()`.

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
const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "At least 6 people" }] });
const confirm = form.register("confirm", {
  dependencies: ["pwd"],
  rules: [{ validator: (v, values) => { if (v !== values.pwd) throw new Error("Two passwords are inconsistent"); } }],
});
<form onSubmit={form.submit((values) => save(values))} noValidate>
  <Field label="password" error={pwd.error}>
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
