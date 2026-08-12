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

### How the binding reports emptiness (`null` and `undefined` are not the same)

`register(name).value` **mirrors `form.values[name]` as-is**, with one exception: a field that never received an initial value (`undefined`) reports `""`, because handing `undefined` to a controlled control makes React treat it as uncontrolled and the first keystroke then triggers the "uncontrolled to controlled" warning.

`null` **passes through** (#220). It is the business value "explicitly cleared / left blank", a step the user picked just like `0` or `""`, so three-state fields work:

```tsx
// null inherits the global setting - 0 is an explicit zero - a positive integer overrides
const form = useForm({ initialValues: { bonus: null as number | null } });
const bonus = form.register("bonus");

<NumberField
  value={bonus.value as number | null}
  onValueChange={bonus.onChange}
  aria-label="Points"
/>
<Button variant="link" size="xs" muted onClick={() => bonus.onChange(null)}>Clear (inherit global)</Button>
```

That was **not** true in 0.37.0 and earlier: the binding read `values[name] ?? ""`, so within one render `form.values.bonus` was `null` while `bonus.value` was `""` - two answers to the same question. Patching it downstream with `?? null` does not help either (`??` only fires on `null` and `undefined`, an empty string sails right through), so the control ends up with an out-of-signature `""` - and [`NumberField`](../number-field/number-field.md) renders that as `0`, while "left blank" and "explicitly zero" are opposite business conclusions.

One boundary: when spreading the binding onto a **native** `<input>` or `<textarea>`, write `value={v ?? ""}` yourself, otherwise React logs "value prop should not be null". Hulian's [`Input`](../input/input.md) and [`Textarea`](../textarea/textarea.md) already fold `null` into an empty string, so they can take it directly.

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
