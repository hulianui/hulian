---
slug: label
name: Label
category: forms
group: framework
tags: []
exports: [Label, labelClass]
status: enriched
---

# Label

> Form label primitive · A real `<label>` with the same styling Field uses, plus htmlFor · forms/framework

## When to use

Use Label when the page already has its own layout and cannot be wrapped in [Field](../field/field.md). The common case is a settings page with one setting per row: label and help text on the left, control on the right.

When you need a label, help text, and validation message wired together with `aria-describedby` and `aria-invalid`, use [Field](../field/field.md) instead. Field also supports the side-by-side layout through `orientation="horizontal"`, which is the more complete answer. Label renders a single label and nothing else.

Do not substitute a polymorphic `Text as="label"`. That only looks like a label: you have to match the font size and weight by hand, the two drift apart as soon as the library changes, and you also have to maintain the `htmlFor` and `id` pairing yourself.

## Import
```ts
import { Label } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| htmlFor | `string` | — | Id of the associated control, rendered as the native `for` attribute. Clicking the label focuses the control, and screen readers announce it as the control name. |
| className | `string` | — | Appended to the `<label>`, whose default is `text-sm font-medium text-foreground`. Classes are merged with twMerge, so passing `text-xs` overrides the default size. |
| children | `ReactNode` | — | Label text. |

Every other native `<label>` attribute (`id`, `title`, `data-*`, `aria-*`, `onClick`, and so on) is forwarded to the root element unchanged.

## Exports

| Name | Type | Description |
|------|------|------|
| labelClass | `string` | Single source of truth for label styling, shared by Label and the label part of Field. Use it when the same styling has to be applied to another element such as a `<legend>` instead of copying the literal. |

## Examples
```tsx
// Basic: htmlFor points at the control id
<Label htmlFor="email">Email</Label>
<Input id="email" placeholder="you@work.com" />

// Settings row: label on the left, control on the right
<div className="flex items-center justify-between">
  <Label htmlFor="sidebar">Keep the sidebar expanded</Label>
  <Switch id="sidebar" defaultChecked />
</div>

// Change the size: className goes through twMerge and overrides the default text-sm
<Label htmlFor="theme" className="text-xs">Theme</Label>
```

## Usage guidelines

- Without `htmlFor` the element is only text that looks like a label: clicking it does not focus anything, and screen readers do not announce it as the control name. When you pass it, keep it identical to the control `id`. [Field](../field/field.md) sets up that relationship for you because Base UI generates and wires the id; a standalone Label leaves it to you.
- When the same control also needs help text, an error message, and `invalid` propagation, do not combine `Label` with a hand-written `<p>`, because the automatic `aria-describedby` relationship is lost. Use [Field](../field/field.md) instead.
- Do not copy the styling into a literal. Change `labelClass` to restyle labels globally, or pass `className` for a local override. A copy makes Field labels and hand-written labels drift apart on the same page.

## Related
[Field](../field/field.md) · [Form](../form/form.md) · [Input](../input/input.md) · [Switch](../switch/switch.md) · [Text](../text/text.md)
