---
slug: markdown
name: Markdown
category: typography
group: text
tags: []
exports: [Markdown, parseBlocks]
status: enriched
---

# Markdown

> Read-only Markdown renderer · dependency-free block parsing for headings, fenced code, lists, blockquotes, emphasis, code, and links · Prose typography + CodeBlock delegation · RSC-safe · typography/text

## When to use

Use Markdown to render a source string as formatted, read-only content. Use [MarkdownEditor] when users must edit the source, [Prose](../prose/prose.md) when content is already HTML or JSX, and [Text](../text/text.md) for a single atomic passage. The exported `parseBlocks` helper supports custom rendering from the block-level AST.

## Import
```ts
import { Markdown, parseBlocks } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "base"` | `"base"` | Typography scale passed to the internal Prose component. |
| className | `string` | — | Additional container class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `string` | Markdown source text (read-only rendering; editing with MarkdownEditor) |

## Example
```tsx
<div className="max-w-2xl">
  <Markdown>{`## Quicksort

\`\`\`js
function quickSort(arr) { /* ... */ }
\`\`\`

Average complexity is **O(n log n)**. Inline \`code\` and [external links](https://mdn.io) render normally.

> Blockquotes inherit Prose semantic tokens.`}</Markdown>
</div>
```

## Usage guidelines

- The dependency-free parser returns JSX and does not use `dangerouslySetInnerHTML` or `innerHTML`, avoiding the stored-XSS sink described in [[dompurify-vhtml-markdown-sanitize]]. If raw HTML support is added later, sanitize it with DOMPurify before rendering; never send untrusted input directly to `innerHTML`.
- Markdown is read-only and exposes no editing callback. Use MarkdownEditor for bidirectional editing.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
