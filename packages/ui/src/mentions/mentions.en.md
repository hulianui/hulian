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

> @-mention input · Textarea styling + trigger-based suggestion popup positioned from a mirrored cursor + `aria-activedescendant` virtual focus · dependency-free · forms/advanced

## When to use

Use Mentions when free-form multiline text needs inline references, such as @-mentioning a person in a comment or linking a ticket with `#`. It is a Textarea with trigger-aware suggestions. Unlike [Combobox](../combobox/combobox.md), which chooses one value for the whole field, Mentions inserts references into otherwise ordinary text and opens suggestions only after a trigger.

## Import
```ts
import { Mentions, MentionText, type MentionTextProps, findTrigger, insertMention, defaultFilter, segmentMentions, type MentionSegment } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| options* | `MentionOption[]` | — | Suggestions; each item has `value` and `label`, with optional `description`/`startContent`/`disabled`. |
| value | `string` | — | Controlled text value; pair with `onChange`. |
| defaultValue | `string` | — | Initial text when uncontrolled. |
| prefix | `string` | `"@"` | Trigger, including multicharacter values such as `"@@"` or `"#"`. Suggestions open when it follows whitespace or the start of a line. |
| filter | `false \| ((option, query) => boolean)` | Built-in substring match | `false` disables local filtering for `onSearch`; a function supplies custom filtering; the default matches `label` and `value` case-insensitively. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Textarea skin size (reuse the size variant of Textarea) |
| invalid | `boolean` | `false` | Applies invalid styling when used outside Field. |
| placeholder | `string` | — | Placeholder passed to the textarea. |
| rows | `number` | — | Row count passed to the textarea. |
| disabled | `boolean` | `false` | Disables the input. |
| className | `string` | — | Container class name |
| popupClassName | `string` | — | Candidate floating layer additional class name |

> Also accepts native Textarea attributes except the omitted `size`/`value`/`defaultValue`/`onChange`/`onSelect`/`prefix` fields.

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

- Pair controlled `value` with `onChange`, or the text cannot be edited, just like a native controlled textarea.
- Inserted text is `prefix + label + " "`; `label` is both the visible name and the literal stored in the text. Use `onSelect` to handle cases where display and stored values must differ.
- For external or asynchronous filtering, set `filter={false}` and refresh `options` from `onSearch`; otherwise the built-in substring filter will filter the consumer's results a second time.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
