---
slug: snippet
name: Snippet
category: typography
group: code
tags: []
exports: [Snippet, SnippetGroup]
status: enriched
---

# Snippet

> Presents a compact command or code snippet with one-click copying. · typography/code

## When to use

Use Snippet for a single-line command or code fragment with an optional prompt and one-click copy, such as an install command or CLI instruction. Use [CodeBlock](../code-block/code-block.md) for multiline code, or [Code](../code/code.md) for inline code without copy behavior.

## Import
```ts
import { Snippet, SnippetGroup } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | - | Clipboard text; defaults to `children` when it is a string. |
| symbol | `string \| null` | `"$"` | Command prompt; pass `null` for non-command fragments. |
| lang | `string` | - | Syntax coloring language (such as `"tsx"`/`"bash"`), only takes effect when children is a string |
| highlight | `boolean` | `true` | Whether to use syntax coloring, only takes effect when children is a string |
| copyLabel | `string` | Locale value | Copy-button accessible label; an explicit value takes precedence. |
| copiedLabel | `string` | Locale value | Post-copy accessible label; an explicit value takes precedence. |
| muted | `boolean` | `false` | A secondary row: a slightly sunken background and secondary-gray text (an alternative command, a link meant for an AI assistant). |
| className | `string` | - | Container class name |

**SnippetGroup** (several copyable commands stacked in one card; the group draws the frame and row separators, and each Snippet inside drops its own border and background and spans the row)

| Name | Type | Default | Description |
|------|------|------|------|
| overlay | `ReactNode` | - | An absolutely positioned decorative layer (BorderBeam and similar), drawn outside the separated list so it doesn't count as a row. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Display content (string or node) |

## Example
```tsx
<Snippet>pnpm add @hulianui/ui</Snippet>

// Non-command fragment without a prompt
<Snippet symbol={null}>const theme = useTheme()</Snippet>

// A set of getting-started steps stacked in one card; the last row is secondary
<SnippetGroup overlay={<BorderBeam size={120} />}>
  <Snippet>pnpm add @hulianui/ui @hulianui/tokens</Snippet>
  <Snippet>npx @hulianui/mcp init-agent</Snippet>
  <Snippet symbol={null} highlight={false} muted>https://hulian.dev/start</Snippet>
</SnippetGroup>
```

## Usage guidelines

- Syntax highlighting through `lang`/`highlight` and automatic clipboard text apply only when `children` is a **string**. For a React node, provide `text` explicitly for copying.
- Default copy labels follow `ConfigProvider locale`; `enUS` provides “Copy / Copied”, and the no-provider fallback remains Chinese.
- The snippet never grows wider than its parent: a long run without spaces (a URL, a token) wraps at any point when it does not fit. Up to 0.74.1 it did not wrap and pushed the snippet and its parent past the viewport.

## Related
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
