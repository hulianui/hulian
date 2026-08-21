---
slug: pro-form
name: ProForm
category: forms
group: framework
tags: []
exports: [ProForm]
status: enriched
---

# ProForm

> Coordinates form state with submit-reset footers, async loading, and custom footer content. · forms/framework

## When to use

Use ProForm for a persistent inline form that needs its own submit/reset footer and responsive field grid, such as an edit or settings page. It is the inline counterpart to [ModalForm / DrawerForm](../form-dialog/form-dialog.md): both integrate useForm and an automatic footer, but ProForm does not open an overlay. Use ModalForm or DrawerForm inside an overlay, [Form](../form/form.md) for a bare container with a consumer-owned footer, or [SearchForm](../search-form/search-form.md) for query filters.

## Import
```ts
import { ProForm } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| form | `FormInstance` | - | useForm instance. When provided, submission calls `validate()` first and reset calls `form.resetFields()`. |
| submitText | `string` | `locale.proForm.submit` | Submit button label. |
| resetText | `string` | `locale.proForm.reset` | Reset button label. |
| showReset | `boolean` | `true` | Shows the reset button; meaningful only when `form` is provided. |
| columns | `1 \| 2 \| 3` | `1` | Field-grid columns. Counts ≥2 respond to container width and collapse to one column when narrow. Use `<Field colSpan="full">` for a full row. |
| footerAlign | `"left" \| "right"` | `"left"` | Footer action alignment. |
| className | `string` | - | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onFinish | `(values: FormValues) => void \| boolean \| Promise<void \| boolean>` | Submission callback. A Promise enables button loading; rejection is absorbed so the consumer can present feedback. |

## Slots

| Slot | Type | Description |
|------|------|------|
| footer | `ReactNode` | Customize the bottom action area (override the default submit/reset button) |
| children | `ReactNode` | form fields |

## Example
```tsx
const form = useForm({ initialValues: { name: "", email: "" } });
const name = form.register("name", { rules: [{ required: true, message: "Please enter name" }] });
const email = form.register("email", { rules: [{ pattern: /@/, message: "Email must contain @" }] });

<ProForm form={form} onFinish={async (v) => { await api.save(v); }}>
  <Field label="Name" error={name.error}>
    <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
  <Field label="Email" error={email.error}>
    <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} />
  </Field>
</ProForm>
```
```tsx
// Container-responsive grid; full-width fields span every column
<ProForm form={form} columns={2} submitText="Save" onFinish={() => {}}>
  <Field label="First name"><Input {...bind(reg.first)} /></Field>
  <Field label="Last name"><Input {...bind(reg.last)} /></Field>
  <Field label="Street address" colSpan="full"><Input {...bind(reg.addr)} /></Field>
</ProForm>
```

## Usage guidelines

- `columns` responds to the **form container**, not the viewport. Do not recreate the grid with media queries; use `<Field colSpan="full">` for a field spanning all columns.
- Unlike ModalForm, ProForm absorbs a rejected `onFinish` Promise. Present errors through consumer-owned feedback such as a toast.
- Reset requires `form` because it calls `form.resetFields()`. Supplying `footer` **replaces** the default submit/reset controls, so custom footer actions must invoke the desired submission and reset logic.

## Related
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
