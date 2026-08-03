---
slug: prose
name: Prose
category: typography
group: text
tags: []
exports: [Prose]
status: enriched
---

# Prose

> Typography container · semantic-token styling for rich-text descendants · dependency-free · RSC-safe · typography/text

## When to use

Use Prose around already-rendered rich text such as Markdown-to-HTML output, MDX, or handwritten JSX. Descendant selectors give headings, paragraphs, lists, links, inline code, and blockquotes consistent typography across light and dark themes. If the content is a Markdown source string, use [Markdown](../markdown/markdown.md), which already wraps Prose. Use [Text](../text/text.md) or [Heading](../heading/heading.md) for atomic content rather than wrapping a single sentence.

## Import
```ts
import { Prose } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| as | `ElementType` | `"article"` | Container element to render. |
| size | `"sm" \| "base"` | `"base"` | Typography scale. `sm` uses a `text-sm` base for long content in sidebars or cards. |

Inherits `HTMLAttributes<HTMLElement>` (`className` / `style`, etc.).

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Rich text content (HTML/JSX) |

## Example
```tsx
<Prose className="max-w-2xl">
  <h1>HulianUI typography with Prose</h1>
  <p>Rendered rich text receives consistent styling for <a href="#">links</a> and <code>inline code</code>.</p>
  <blockquote>Typography sets the rules while content preserves its semantics.</blockquote>
</Prose>
```

Compact content:
```tsx
<Prose size="sm" className="max-w-2xl">{/* Sidebar or card description */}</Prose>
```

## Usage guidelines

- See [[chat-bubble-max-w-prose-overflows-narrow-column]]: `max-w-prose` (65ch, approximately 398 px) is an absolute maximum that does not account for parent width. In a narrow flex column it can overflow or clip. Use `max-w-[min(65ch,100%)]` and add `min-w-0` to flex ancestors. Do not combine `max-w-prose max-w-full`; both set the same property, so stylesheet order decides which wins.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
