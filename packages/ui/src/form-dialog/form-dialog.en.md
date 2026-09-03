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

> Runs validated forms inside modal or drawer containers with submit lifecycle handling. · forms/framework

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
| title * | `string` | - | Title (a11y label) |
| open | `boolean` | - | controlled switch |
| defaultOpen | `boolean` | - | Uncontrolled initial switch |
| form | `FormInstance` | - | useForm instance: If provided, it will automatically `validate()` before submission, but the verification will remain open. |
| submitText | `string` | `locale.modalForm.submit` | Submit button copy |
| cancelText | `string` | `locale.modalForm.cancel` | Cancel button copy |
| className | `string` | - | Container class name (control width, etc.) |
| side | `DrawerSide` | `"right"` | `DrawerForm` only: drawer welt direction |
| draggable | `boolean` | `false` | `ModalForm` only: lets the user move the dialog by holding the title (passed through to [DialogContent.draggable](../dialog/dialog.md)) |
| dismissible | `boolean` | `false` | Whether pressing the backdrop closes the dialog. **The opposite of the `Dialog` and `Drawer` primitives**, because this component knows it holds a form and losing a half-filled one to a stray click costs far more than the convenience is worth (#343). Pass `true` to restore the primitive behaviour |
| confirmOnClose | `boolean` | `true` | Ask for confirmation before closing an edited form. The test is `form.isDirty()`, so it **does nothing without a `form`**; an untouched form closes straight away, and so does the close that follows a successful submit |
| discardTitle | `ReactNode` | locale `modalForm.discardTitle` | Title of the discard confirmation |
| discardDescription | `ReactNode` | locale `modalForm.discardDescription` | Body copy of the discard confirmation |

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

### Closing this form is not free (#343)

`ModalForm` and `DrawerForm` deliberately differ from the bare `Dialog` and `Drawer`: **pressing the backdrop does not close them**. A primitive is a general container where dismissing by clicking outside is reasonable. This component always holds a form, and wiping out eight filled fields because the pointer landed just outside the window costs far more than that convenience is worth.

The exits remain, with one confirmation added: Esc and the top-right close button first ask "Discard unsaved changes?" whenever `form.isDirty()` is true. Three cases never interrupt you: no `form` was passed, so dirtiness cannot be judged; the form is untouched; and the close that follows a successful submit.

```tsx
// Default: the backdrop does not close it, and an edited form asks first
<ModalForm title="Add school" form={form} onFinish={save}>…</ModalForm>

// Restore the primitive behaviour
<ModalForm dismissible confirmOnClose={false} …>…</ModalForm>

// Decide for yourself: details.reason separates backdrop, Esc and close button
<ModalForm onOpenChange={(open, details) => {
  if (!open && details?.reason === "outside-press") details.cancel();
}} …>…</ModalForm>
```

The confirmation is rendered by the component itself through `AlertDialog`, so it **does not require a `ModalProvider`**. The imperative `modal.confirm` shows nothing in an app that never mounted the provider, and since the close has already been intercepted at that point, the result would be a dialog that neither closes nor explains itself.

## Related
[Form](../form/form.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
