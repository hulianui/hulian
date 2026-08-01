---
slug: form-dialog
name: ModalForm / DrawerForm
category: forms
group: framework
tags: []
exports: [ModalForm, DrawerForm]
status: enriched
---

# ModalForm / DrawerForm

> Modal and drawer forms · Shared add/edit layout using Dialog or Drawer, `useForm`, submit footer, pre-submit validation, async `onFinish`, and localized copy · forms/framework

## When to use

Use `ModalForm` or `DrawerForm` for Add/Edit flows launched from a list page. ModalForm opens a centered dialog; DrawerForm opens from an edge and adds the `side` prop. Both compose Dialog or Drawer with validation and a submit footer. Use [ProForm](../pro-form/pro-form.md) for an inline page form, [Form](../form/form.md) for a bare container, or [StepsForm](../steps-form/steps-form.md) for a wizard.

## Import
```ts
import { ModalForm, DrawerForm } from "@hulianui/ui"
```

## Props

Public (`ModalForm` = `FormDialogBaseProps`; `DrawerForm` plus `side` on this basis):

| Name | Type | Default | Description |
|------|------|------|------|
| title * | `string` | — | Title (a11y label) |
| open | `boolean` | — | controlled switch |
| defaultOpen | `boolean` | — | Uncontrolled initial switch |
| form | `FormInstance` | — | useForm instance: If provided, it will automatically `validate()` before submission, but the verification will remain open. |
| submitText | `string` | `locale.modalForm.submit` | Submit button copy |
| cancelText | `string` | `locale.modalForm.cancel` | Cancel button copy |
| className | `string` | — | Container class name (control width, etc.) |
| side | `DrawerSide` | `"right"` | `DrawerForm` only: drawer welt direction |

## Events

| Event | Type | Description |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | Switch change callback |
| onFinish | `(values: FormValues) => void \| boolean \| Promise<void \| boolean>` | Submit callback; return Promise → button loading; resolve (not false) automatically close; reject or return false to keep it open |

## Slots

| Slot | Type | Description |
|------|------|------|
| trigger | `ReactElement` | Trigger element (for uncontrolled opening); can be omitted when controlled |
| children | `ReactNode` | form fields |

## Examples
```tsx
const form = useForm({ initialValues: { name: "" } });
const name = form.register("name", { rules: [{ required: true, message: "Please enter name" }] });

<ModalForm
  title="Add new employees"
  form={form}
trigger={<Button> adds </Button>}
  onFinish={async (values) => { await api.create(values); }} // Automatically close after verification passes + success
>
  <Field label="Name" error={name.error}>
    <Input value={name.value} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
</ModalForm>
```

## Usage guidelines

- Closing is determined by `onFinish`: resolving to anything except `false` closes automatically; reject or return `false` to keep the form open. Do not also call `onOpenChange(false)` from `onFinish`.
- Only when `form` is passed will it be automatically `validate()` before submission and will remain open if the verification fails; if the form is not passed, the verification will not be performed and the values will be handed over to onFinish directly.
- Call `form.resetFields()` yourself after a successful submission if fields should clear; the component does not reset them automatically.

## Related
[Form](../form/form.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
