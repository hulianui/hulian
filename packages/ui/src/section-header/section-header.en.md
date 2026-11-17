---
slug: section-header
name: SectionHeader
category: typography
group: text
tags: []
exports: [SectionHeader]
status: enriched
---

# SectionHeader

> The heading group at the start of a section: eyebrow, large title, accented half, and lead text. · typography/text

## When to use

The group that opens each section on a marketing page or docs home: a small eyebrow (section name), a large section title whose second half is accented, and a lead paragraph. For the title bar at the top of an admin page (back button, breadcrumbs, actions), use [PageHeader](../page-header/page-header.md); for just a heading, use [Heading](../heading/heading.md).

## Import
```ts
import { SectionHeader } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| title* | `ReactNode` | - | The title |
| eyebrow | `ReactNode` | - | A short line above the title (section name), in the accent color |
| accent | `ReactNode` | - | The second half of the title, accented |
| accentBreak | `"always" \| "mobile" \| "space" \| "none"` | `"always"` | How the title joins `accent`: `always` breaks the line; `mobile` breaks only on narrow screens; `space` stays on one line with a space (English); `none` joins directly (Chinese) |
| description | `ReactNode` | - | Lead text under the title, in secondary gray, up to about 42rem wide |
| align | `"start" \| "center"` | `"start"` | Alignment; with `center` the lead text is centered too |
| level | `2 \| 3 \| 4` | `2` | Semantic heading level; the visual size stays at the section-title step (30px on narrow screens, 36px from sm up) |

> Extends native `<div>` attributes (`className` lands on the outer container, for width and margins).

## Examples
```tsx
<SectionHeader
  eyebrow="Products"
  title="From one button,"
  accent="to a whole back office"
  accentBreak="mobile"
  description="Four layers, one design language. Copy what you need."
/>

// A centered closing section
<SectionHeader align="center" title="Start building software" accent="that looks as good as it works" accentBreak="space" />

// English: one line with a space
<SectionHeader eyebrow="In production" title="Built natively" accent="on Hulian UI" accentBreak="space" />
```

## Pitfalls

- Use `accentBreak="none"` when a Chinese title should read as one run and `"space"` for English; the default `"always"` breaks the line between the halves.
- Keep punctuation with the first half (`title="From one button,"`): the `mobile` break happens before `accent`, so punctuation inside `accent` would start the line on narrow screens.

## Related
[Heading](../heading/heading.md) · [PageHeader](../page-header/page-header.md) · [Text](../text/text.md)
