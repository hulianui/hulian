---
slug: snippet
name: Snippet
category: typography
group: code
tags: []
exports: [Snippet]
status: enriched
---

# Snippet

> Code snippets · Command prompt + one-click copy (clipboard + feedback) · typography/code

## When to use

Use Snippet for a single-line command or code fragment with an optional prompt and one-click copy, such as an install command or CLI instruction. Use [CodeBlock](../code-block/code-block.md) for multiline code, or [Code](../code/code.md) for inline code without copy behavior.

## Import
```ts
import { Snippet } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | — | Clipboard text; defaults to `children` when it is a string. |
| symbol | `string \| null` | `"$"` | Command prompt; pass `null` for non-command fragments. |
| lang | `string` | — | Syntax coloring language (such as `"tsx"`/`"bash"`), only takes effect when children is a string |
| highlight | `boolean` | `true` | Whether to use syntax coloring, only takes effect when children is a string |
| copyLabel | `string` | Locale value | Copy-button accessible label; an explicit value takes precedence. |
| copiedLabel | `string` | Locale value | Post-copy accessible label; an explicit value takes precedence. |
| className | `string` | — | Container class name |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Display content (string or node) |

## Example
```tsx
<Snippet>pnpm add @hulianui/ui</Snippet>

// Non-command fragment without a prompt
<Snippet symbol={null}>const theme = useTheme()</Snippet>
```

## Usage guidelines

- Syntax highlighting through `lang`/`highlight` and automatic clipboard text apply only when `children` is a **string**. For a React node, provide `text` explicitly for copying.
- Default copy labels follow `ConfigProvider locale`; `enUS` provides “Copy / Copied”, and the no-provider fallback remains Chinese.

## Related
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
