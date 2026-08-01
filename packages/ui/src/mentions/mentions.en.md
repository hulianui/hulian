---
slug: mentions
name: Mentions
category: forms
group: advanced
tags: []
exports: [Mentions, MentionText, type MentionTextProps, findTrigger, insertMention, defaultFilter, segmentMentions, type MentionSegment]
status: enriched
---

# Mentions

> Inline mentions · Trigger-aware suggestions for multiline text · Mirrored-caret positioning and `aria-activedescendant` focus · forms/advanced

## When to use

Use Mentions when free-form multiline text needs inline references, such as mentioning a person with `@` or linking a ticket with `#`. It behaves like a Textarea until a configured trigger opens the suggestion popup. Unlike [Combobox](../combobox/combobox.md), which selects the field's entire value, Mentions inserts references into otherwise ordinary text.

## Import
```ts
import { Mentions, MentionText, type MentionTextProps, findTrigger, insertMention, defaultFilter, segmentMentions, type MentionSegment } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| options* | `MentionOption[]` | — | Suggestions containing `value` and `label`, with optional `description`, `startContent`, and `disabled`. |
| value | `string` | — | Controlled text value; pair with `onChange`. |
| defaultValue | `string` | — | Initial text when uncontrolled. |
| prefix | `string` | `"@"` | Trigger, including multi-character values such as `"@@"` or `"#"`. Suggestions open only at the start of a line or after whitespace. |
| filter | `false \| ((option, query) => boolean)` | Built-in substring match | Pass `false` to disable local filtering and use `onSearch`, or pass a function for custom filtering. The default matches `label` and `value` case-insensitively. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Textarea visual size. |
| invalid | `boolean` | `false` | Applies invalid styling when used outside Field. |
| placeholder | `string` | — | Placeholder passed to the textarea. |
| rows | `number` | `3` | Row count passed to the textarea. |
| disabled | `boolean` | `false` | Disables the input. |
| className | `string` | — | Additional class name for the field container. |
| popupClassName | `string` | — | Additional class name for the suggestion popup. |

> Also accepts native Textarea attributes except `size`, `value`, `defaultValue`, `onChange`, `onSelect`, and `prefix`, which use the component-specific contracts above.

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(value: string) => void` | Called when text changes; required when controlled. |
| onSearch | `(query: string) => void` | Reports query changes for external or asynchronous filtering; it does not return results. |
| onSelect | `(option: MentionOption) => void` | Called with the complete selected option. |

## Example
```tsx
<Mentions
  options={people}
  defaultValue="Please ask "
  placeholder="Type @ to mention a colleague…"
  onSelect={(o) => console.log(o)}
/>
```

Use `#` to reference a ticket:
```tsx
<Mentions prefix="#" options={tickets} placeholder="Type # to link a ticket…" />
```

## Usage guidelines

- Pair a controlled `value` with `onChange`; otherwise the field is read-only, just like a native controlled textarea.
- Inserted text is `prefix + label + " "`; `label` is both the visible name and the literal stored in the text. Use `onSelect` to handle cases where display and stored values must differ.
- For external or asynchronous filtering, set `filter={false}` and refresh `options` from `onSearch`; otherwise the built-in substring filter will filter the consumer's results a second time.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
