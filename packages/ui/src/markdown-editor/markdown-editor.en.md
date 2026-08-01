---
slug: markdown-editor
name: MarkdownEditor
category: forms
group: advanced
tags: []
exports: [MarkdownEditor]
status: enriched
---

# MarkdownEditor

> WYSIWYG Markdown editor powered by TipTap · Markdown string input/output + hidden-input Field bridge + standard toolbar · forms/advanced

## When to use

Use MarkdownEditor to edit long-form content such as order notes, articles, or formatted descriptions while storing the result as a Markdown string. Set `name` to bridge the value into a native form or [Field](../field/field.md). Use Input for short plain text, or [Mentions](../mentions/mentions.md) when the only advanced requirement is @-mentions.

## Import
```ts
import { MarkdownEditor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | — | Controlled markdown string |
| defaultValue | `string` | — | Initial value when uncontrolled. |
| name | `string` | — | Name of the hidden input used to bridge native forms and Field. |
| placeholder | `string` | `"Enter Markdown…"` | Placeholder shown when the editor is empty. |
| invalid | `boolean` | `false` | Applies the danger style; an enclosing Field may also drive this through `data-invalid`. |
| disabled | `boolean` | `false` | Disables editing. |
| minRows | `number` | `6` | Content area minimum height (rows) |
| className | `string` | — | Additional class name for the editor shell. |
| aria-label | `string` | — | Accessibility label |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(markdown: string) => void` | Content change callback, parameter is markdown string |

## Example
```tsx
// Controlled
const [md, setMd] = useState("# Title");
<MarkdownEditor value={md} onChange={setMd} />

// Field bridge: the hidden input carries form values and validation state
<Field label="Order details (required)" error="Details cannot be empty" className="w-[32rem]">
  <MarkdownEditor name="detail" invalid placeholder="Required" />
</Field>
```

## Usage guidelines

- Values enter and leave as Markdown strings, not TipTap document JSON. Do not pass TipTap's internal rich-text structure as `value`.
- Inside [Field](../field/field.md), either pass `invalid` directly or let the enclosing Field drive `data-invalid`; setting both is unnecessary.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
