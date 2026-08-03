---
slug: code-block
name: CodeBlock
category: typography
group: code
tags: []
exports: [CodeBlock, HighlightedCode, tokenizeCode, type CodeToken, type CodeTokenType]
status: enriched
---

# CodeBlock

> Code block · Multiline `<pre>` with syntax highlighting, language label, and one-click copy feedback · typography/code

## When to use

Use CodeBlock for multiline snippets with built-in syntax coloring, a language label, and one-click copy. Use [Snippet](../snippet/snippet.md) for a single-line command or identifier, [Code](../code/code.md) for inline `code`, or [CodeDiff](../code-diff/code-diff.md) for before-and-after changes.

## Import
```ts
import { CodeBlock, HighlightedCode, tokenizeCode, type CodeToken, type CodeTokenType } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| code* | `string` | — | Code text; use `\n` for multiple lines. |
| lang | `string` | — | Language label shown in the upper-right corner, such as `"tsx"`. It also selects JavaScript-family or shell highlighting rules. |
| copyable | `boolean` | `true` | Whether to show the copy button. |
| highlight | `boolean` | `true` | Whether to apply syntax coloring; disable it for plain text. |
| className | `string` | — | Additional class name for the container. |

## Examples
```tsx
<CodeBlock code={`import { Button } from "@hulianui/ui";`} lang="tsx" />

// Shell languages use shell highlighting rules
<CodeBlock code={`pnpm add @hulianui/ui`} lang="bash" />
```

## Usage guidelines

No component-specific caveats are currently documented.

## Related
[Code](../code/code.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
