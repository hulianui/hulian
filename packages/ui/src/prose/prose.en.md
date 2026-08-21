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

> Styles rich-text descendants with consistent semantic typography tokens. · typography/text

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
| scrollableTables | `boolean` | `false` | Wide-table fallback: turns the `table` itself into a horizontal scroller so many-column tables no longer break out of the measure (headers stop wrapping as part of this). In exchange the table sizes to its content instead of always filling the measure. |

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

Collapsible blocks (GFM `<details>`/`<summary>`; Markdown output is styled as-is, no extra wrapper):
```tsx
<Prose>
  <details open>
    <summary>Show the answer</summary>
    <p>A generator expression yields items lazily and never loads the whole file.</p>
    <details>
      <summary>Show how to read the traceback</summary>
      <p>A nested block uses the subtle background so it separates from the outer surface.</p>
    </details>
  </details>
</Prose>
```

Wide tables (the table scrolls inside itself instead of breaking out of the measure):
```tsx
<Prose scrollableTables>{/* A table with six or more columns */}</Prose>
```

## Usage guidelines

- `scrollableTables` switches the `table` to `display: block` and adds `whitespace-nowrap` to headers. Non-wrapping headers are not decoration, they are what makes scrolling happen at all: with `overflow-x-auto` alone the browser squeezes every column down to its min-content width (CJK collapses to one glyph per line, rows grow several times taller), the content never exceeds the scroller, and nothing scrolls. It looks like a bad font size or breakpoint instead. Body cells keep wrapping: one long non-wrapping description would drag the table so wide that the other columns become unreachable.
- With `scrollableTables` on, the table sizes to its content and no longer always fills the measure (a narrow table shrinks to its content width). Turn it on only for tables that genuinely overflow.
- The reason `scrollableTables` exists applies only to the **HTML string form**: when content arrives through `dangerouslySetInnerHTML`, Prose never sees the table node and cannot wrap it in a scroll container, so the only place left to act is the `table` itself. With **children (JSX nodes)**, prefer wrapping the wide table in your own `overflow-x-auto` container: it targets just the table that overflows and leaves every other table at full width.
- See [[chat-bubble-max-w-prose-overflows-narrow-column]]: `max-w-prose` (65ch, approximately 398 px) is an absolute maximum that does not account for parent width. In a narrow flex column it can overflow or clip. Use `max-w-[min(65ch,100%)]` and add `min-w-0` to flex ancestors. Do not combine `max-w-prose max-w-full`; both set the same property, so stylesheet order decides which wins.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
