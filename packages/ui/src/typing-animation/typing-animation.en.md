---
slug: typing-animation
name: TypingAnimation
category: typography
group: text
tags: [animated]
exports: [TypingAnimation]
status: enriched
---

# TypingAnimation

> Typewriter effect · verbatim text + blinking cursor + viewport trigger · typography/text · #animated

## When to use

Use TypingAnimation to reveal a string character by character with a blinking cursor, starting on viewport entry by default. It suits hero slogans and first-screen copy. Use [WordRotate](../word-rotate/word-rotate.md) to cycle words in a fixed sentence, or [Text](../text/text.md) for static content. State and IntersectionObserver make this a client component.

## Import
```ts
import { TypingAnimation } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text* | `string` | — | Text to be typed verbatim |
| duration | `number` | `80` | milliseconds per word |
| delay | `number` | `0` | Delay in milliseconds before start |
| startOnView | `boolean` | `true` | Start after entering the viewport; set `false` to start immediately |
| showCursor | `boolean` | `true` | Show flashing cursor |

Inherit `ComponentPropsWithoutRef<"span">` (except `children`), such as `className` / `style`.

## Example
```tsx
<TypingAnimation
  text="HulianUI — a composable design system"
  className="text-2xl font-semibold text-foreground"
/>
```

Start immediately (without entering the viewport, often used in the first screen):
```tsx
<TypingAnimation text="Hulian" startOnView={false} duration={60} />
```

## Usage guidelines

- `startOnView` defaults to true. If the component begins outside the viewport and the page never scrolls—such as a screenshot or headless check—it remains blank. Set `startOnView={false}` for immediate first-screen or test rendering.
- The `"use client"` component may be nested under a server component but is not itself a pure RSC.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
