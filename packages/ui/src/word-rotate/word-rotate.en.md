---
slug: word-rotate
name: WordRotate
category: typography
group: text
tags: [animated]
exports: [WordRotate]
status: enriched
---

# WordRotate

> Rotating words · Motion enter/exit transitions + reduced-motion fallback · typography/text · #animated

## When to use

Use WordRotate to cycle alternatives inside a fixed phrase, such as “Build faster / safer / more beautifully,” with Motion enter and exit transitions. Use [TypingAnimation](../typing-animation/typing-animation.md) for character-by-character typing, or [Text](../text/text.md) for static copy. Motion and state make this a client component.

## Import
```ts
import { WordRotate } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| words* | `string[]` | — | rotated word array |
| duration | `number` | `2500` | milliseconds per word |

Inherit `ComponentPropsWithoutRef<"span">` (except `children` and motion conflict `onDrag`/`onDragStart`/`onDragEnd`/`onAnimationStart`), such as `className` / `style`.

## Example
```tsx
<div className="text-3xl font-bold text-foreground">
  Build <WordRotate words={["faster", "safer", "more beautifully", "with HulianUI"]} className="text-primary" />
</div>
```

## Usage guidelines

- Props pass to `motion.span`, but the public type excludes `onDrag`, `onDragStart`, `onDragEnd`, and `onAnimationStart` because Motion 12 gives them gesture/animation signatures that conflict with DOM handlers.
- The `"use client"` component may be nested under a server component but is not itself a pure RSC.
- Under `prefers-reduced-motion`, word changes remain visible without animated enter and exit transitions.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
