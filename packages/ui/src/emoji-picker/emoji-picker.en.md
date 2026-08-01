---
slug: emoji-picker
name: EmojiPicker
category: forms
group: advanced
tags: []
exports: [EmojiPicker, EMOJI_CATEGORIES, ALL_EMOJI]
status: enriched
---

# EmojiPicker

> Emoji picker · Built-in seven-category dataset with Chinese/English keywords, search, category tabs, controlled or internal recents, and `onSelect` · forms/advanced

## When to use

Use EmojiPicker beside a chat or comment input. It includes searchable emoji data across seven categories with Chinese and English keywords. The component is a panel only; wrap it in [Popover](../popover/popover.md) or another overlay for trigger and positioning behavior.

## Import
```ts
import { EmojiPicker, EMOJI_CATEGORIES, ALL_EMOJI } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| columns | `number` | `8` | Number of grid columns |
| searchable | `boolean` | `true` | Whether to display the search box |
| defaultCategory | `string` | first category | Initial classification key |
| recent | `string[]` | — | Controlled "recently used" list; if omitted, the component is maintained internally |
| searchPlaceholder | `string` | `"\u641c\u7d22\u8868\u60c5"` | Search placeholder; the built-in Chinese copy means “Search emoji.” |
| className | `string` | — | supports to container |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(emoji: string) => void` | Select the callback of an emoji, the parameter is the emoji character |

## Examples
```tsx
// Append the selected emoji to an input
const [text, setText] = useState("");
<EmojiPicker onSelect={(e) => setText((t) => t + e)} />

// Controlled recents, hidden search, and a compact six-column grid
<EmojiPicker columns={6} searchable={false} recent={["🔥", "💯", "👍", "🎉", "❤️"]} onSelect={insert} />
```

## Usage guidelines

- Passing `recent` enables controlled mode. Maintain it from `onSelect`; when omitted, the component updates recent emoji internally.
- EmojiPicker has no trigger or popup positioning. Compose it with [Popover](../popover/popover.md) for a popup button.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
