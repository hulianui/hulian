---
slug: markdown
name: Markdown
category: typography
group: text
tags: []
exports: [Markdown, parseBlocks, slugifyHeading, extractHeadings]
status: enriched
---

# Markdown

> Renders read-only Markdown blocks, inline formatting, links, quotes, lists, and fenced code. · typography/text

## When to use

Use Markdown to render a source string as formatted, read-only content. Use [MarkdownEditor] when users must edit the source, [Prose](../prose/prose.md) when content is already HTML or JSX, and [Text](../text/text.md) for a single atomic passage. The exported `parseBlocks` helper supports custom rendering from the block-level AST. For long documents that need a table of contents or shareable `#fragment` links, turn on `headingIds` and build the entries with `extractHeadings` (see below).

## Import
```ts
import { Markdown, parseBlocks, extractHeadings, slugifyHeading } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "base"` | `"base"` | Typography scale passed to the internal Prose component. |
| headingIds | `boolean \| string` | `false` | Adds anchor ids to rendered headings (slug rules under "Heading anchors and tables of contents") so long pages can offer a table of contents and `#fragment` deep links. Off by default: ids share one global namespace, so generating them by default would add ids to every existing call site that may collide with ids already on the page. Pass a string to enable them and use it as an id prefix (`headingIds="doc-"` yields `doc-props`), which keeps this batch of ids in its own namespace. |
| className | `string` | - | Additional container class name. |

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

## Heading anchors and tables of contents

Turn on `headingIds` to give every heading an id, then build the entries with `extractHeadings` from the **same source string**. Both sides share one slug rule, so the anchors cannot drift apart:

```tsx
const md = "## Install\n\n### One-line setup\n\n## Rules";
const toc = extractHeadings(md).map((h) => ({ href: `#${h.id}`, title: h.plainText, level: h.level }));

<article className="[&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20">
  <Markdown headingIds>{md}</Markdown>
</article>
<Anchor items={toc.filter((t) => t.level === 2)} offsetTop={88} />
```

When the host page carries ids of its own (page level sections, or an element rendered by one of the examples), pass a prefix instead: `<Markdown headingIds="doc-">` together with `extractHeadings(md, "doc-")`. The two prefixes must match.

Each entry from `extractHeadings` is `{ level, text, plainText, id }`. `text` keeps the original heading source including inline markers, while `plainText` has them stripped: use it for the table of contents label, because a plain string label would otherwise show backticks and asterisks verbatim.

Slug rules: strip inline markers (`` `code` ``, `**bold**`, `*italic*`, `[text](link)`), lowercase (ASCII only), collapse whitespace into hyphens, keep only Unicode letters, digits, `-`, and `_` (so CJK headings survive verbatim), then collapse and trim hyphens. A heading that loses every character (empty or punctuation only) falls back to `section`. Repeated headings get `-1` and `-2` suffixes in document order. Use `slugifyHeading(text)` when you need the rule for a single heading.

## Usage guidelines

- The dependency-free parser returns JSX and does not use `dangerouslySetInnerHTML` or `innerHTML`, avoiding the stored-XSS sink described in [[dompurify-vhtml-markdown-sanitize]]. If raw HTML support is added later, sanitize it with DOMPurify before rendering; never send untrusted input directly to `innerHTML`.
- Markdown is read-only and exposes no editing callback. Use MarkdownEditor for bidirectional editing.
- Extract the table of contents from the **same source string** you render. A page that renders the body without its leading header but extracts from the full original ends up with a top-level entry that does not exist on the page, and clicking it goes nowhere.
- The component reserves no `scroll-mt-*` for you. When a sticky header covers the landing position, add descendant classes such as `[&_h2]:scroll-mt-20` on an outer container, and keep that value in step with the `offsetTop` of `Anchor`, otherwise the highlight always lags by one entry.
- When the real scroll container is not the window (an inner `<main>` with `overflow-y-auto`, for example), pass `getContainer` to `Anchor` so clicks actually scroll.

## Related
[Anchor](../anchor/anchor.md) · [Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
