---
slug: field
name: Field
category: forms
group: framework
tags: []
exports: [Field]
status: enriched
---

# Field

> Form field · Label, help text, and error content with automatic accessible relationships · forms/framework

## When to use

Use Field to pair one control such as Input or Textarea with its label, help text, and error message. It connects them through `aria-describedby` and `aria-invalid`. [Form](../form/form.md) and [ProForm](../pro-form/pro-form.md) use Field internally, and it can also compose custom rows or controls inside [StepsForm](../steps-form/steps-form.md).

## Import
```ts
import { Field } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| invalid | `boolean` | `false` | Explicit invalid state; a nonempty `error` also marks the field invalid. |
| disabled | `boolean` | `false` | Disables the field. |
| name | `string` | — | Submit ID, supports Field.Root |
| colSpan | `"full"` | — | Spanning entire rows in ProForm columns grid; no side effects outside grid |
| className | `string` | — | Fall on Field.Root (portrait layout container) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Field control, such as HulianUI Input or Textarea. |
| label | `ReactNode` | Label |
| description | `ReactNode` | Help text. |
| error | `ReactNode` | Error copy; **If it is not empty, it means invalid and forces an error to be displayed** |

## Examples
```tsx
// Basic
<Field label="Email" description="We will not publish your email address">
  <Input placeholder="you@work.com" />
</Field>

// A non-empty error adds invalid styling, visible text, and ARIA description
<Field label="Email" error="Enter a valid email address">
  <Input defaultValue="not-an-email" />
</Field>
```

## Usage guidelines

- A non-empty `error` already implies `invalid`; do not pass both. Pass `invalid` alone only when the control needs invalid styling without an error message.
- The bottom layer is Base UI Field, and the error text is forced to be rendered through `match={true}` - do not write an error in another `<p>` outside the Field, otherwise the automatic `aria-describedby` concatenation will be lost. For details, see [[base-ui-field-error-match-true-for-external-controlled-error]]: When externally controlled error does not go through Base UI verification, the default branch will make the error text "no red text in the box".
- For a Textarea child, follow the render-as typing guidance in [[base-ui-field-control-render-textarea-type-safe]].

## Related
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [SearchForm](../search-form/search-form.md)
