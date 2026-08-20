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

> Form field wrapper · Labels, descriptions, errors, and automatic ARIA relationships · forms/framework

## When to use

Use Field to associate one control, such as Input or Textarea, with a label, supporting description, and validation error. Field wires those elements together with `aria-describedby` and `aria-invalid`. [Form](../form/form.md) and [ProForm](../pro-form/pro-form.md) use it internally; it is also suitable for custom form rows and controls inside [StepsForm](../steps-form/steps-form.md).

## Import
```ts
import { Field } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| invalid | `boolean` | `false` | Explicit invalid state; a nonempty `error` also marks the field invalid. |
| required | `boolean` | `false` | Required state: renders a red asterisk before the label and injects `aria-required` into the control. It performs **no validation** — rules remain the only source of validation — and exists so users can see which fields are required before submitting. `register()` from `useForm` derives `required` from the rules, so it can be forwarded directly. |
| requiredMark | `boolean \| ReactNode` | `true` | Shape of the required marker. `false` keeps `aria-required` without drawing a marker; a ReactNode replaces the default asterisk. Ignored when `required` is falsy. |
| disabled | `boolean` | `false` | Disables the field. |
| name | `string` | — | Field name forwarded to the underlying `Field.Root`. |
| orientation | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction. `horizontal` places the label area on the left, the control on the right, and the error message on its own full-width row, which is the one-setting-per-row layout of a settings page. ARIA wiring and error rendering are identical in both directions. |
| colSpan | `"full"` | — | Spans the full row in a ProForm column grid; has no effect outside that grid. |
| className | `string` | — | Additional class name for the `Field.Root` container, which is a flex column when vertical and a two-column grid when horizontal. |
| labelClassName | `string` | — | Appended to the label, whose default is `text-sm font-medium text-foreground w-fit`. Classes are merged with twMerge, so passing `text-xs` overrides the default size and `w-full` restores a full-width label. |
| descriptionClassName | `string` | — | Appended to the description, whose default is `text-xs text-muted-foreground`. |
| errorClassName | `string` | — | Appended to the error message, whose default is `text-xs text-danger`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Field control, such as HulianUI Input or Textarea. |
| label | `ReactNode` | Visible field label. |
| description | `ReactNode` | Help text. |
| error | `ReactNode` | Validation message. Any nonempty value marks the field invalid and renders the error. |

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

// Required: asterisk plus aria-required, while validation still lives in the rules
const email = form.register("email", { rules: [{ required: true, message: "Enter your email" }] });
<Field label="Email" required={email.required} error={email.error}>
  <Input value={email.value} onChange={email.onChange} onBlur={email.onBlur} />
</Field>

// Horizontal settings row: label on the left, control on the right, error below
<Field orientation="horizontal" label="Theme" description="Pick your preferred color scheme">
  <Select items={themes} />
</Field>

// Horizontal with a fixed label column: override the column template, no extra prop
<Field orientation="horizontal" label="Email" className="grid-cols-[8rem_1fr]">
  <Input placeholder="you@work.com" />
</Field>
```

## Usage guidelines

- `required` can inject `aria-required` **only when `children` is a single element**, since that is the only node Field can reach. When children is a fragment (control plus a button) or plain text, set `aria-required` on the control yourself; otherwise assistive technology never learns the field is required, because a decorative asterisk is `aria-hidden`.
- `aria-required` is only valid on **input-like roles** (textbox, combobox, listbox, radiogroup, checkbox, …). When the control's focusable element is a `role="button"` — the dropzone of [Upload](../upload/upload.md) being the typical case — injecting it changes nothing for screen readers, so that class of component translates the required state into a description itself. Usage does not change.
- The label shrinks to its text by default (`w-fit`). It is a real `<label>` with `htmlFor`, so when flex stretches it across the row, the invisible space after the text still forwards clicks to the control — for overlay controls that reads as "the dropdown opened out of nowhere when I clicked above it". Pass `labelClassName="w-full"` when you need a full-width label, for example to push a switch to the far right.
- Do not wrap the label in a hand-rolled `RequiredLabel` just to draw an asterisk: that marks the field for sighted users only, and every page ends up with a different asterisk position and color.
- A non-empty `error` already implies `invalid`; do not pass both. Pass `invalid` alone only when the control needs invalid styling without an error message.
- Field uses Base UI Field and renders externally controlled errors with `match={true}`. Keep the error inside Field so it remains part of the generated `aria-describedby` relationship; a separate `<p>` will not be connected automatically. See [[base-ui-field-error-match-true-for-external-controlled-error]].
- For a Textarea child, follow the render-as typing guidance in [[base-ui-field-control-render-textarea-type-safe]].
- There is **no** separate prop for the horizontal label column width. With `orientation="horizontal"` the `Field.Root` is a `grid-cols-[1fr_auto]` grid, so pass `className="grid-cols-[8rem_1fr]"` to override the column template. The default `auto` column keeps the control flush right, which suits settings rows; `1fr` lets the control fill the remaining width, which suits form rows.
- When you only need a label, without the help text, error message, and ARIA wiring, use [Label](../label/label.md) rather than wrapping an empty Field just to borrow the label styling.

## Related
[Label](../label/label.md) · [Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [SearchForm](../search-form/search-form.md)
