---
slug: flip-text
name: FlipText
category: typography
group: text
tags: [animated]
exports: [FlipText]
status: enriched
---

# FlipText

> Flipping heading · characters flip in 3D on hover · takes children rather than a text string, `as` participates in type inference so it *is* the h1/h2, plays one full round instead of following hover state, pure CSS keyframes with no motion runtime, and the back face lives in a pseudo-element so `textContent` stays clean · typography/text · #animated

## When to use

Use FlipText for a page or card **heading** that should react to the pointer: on mouse enter, the characters flip over one by one.

The line between this and the other text effects in the library is sharp: those are **entrance** animations (they play once as the text scrolls into view and then rest), while this is a **hover interaction** that replays on every enter. Use [SplitText](../split-text/split-text.md) for a staggered entrance, [BlurText](../blur-text/blur-text.md) for a blur-to-sharp reveal, [TextReveal](../text-reveal/text-reveal.md) for "this is in progress", and [Heading](../heading/heading.md) for a plain static title.

It pairs with [PageHeader](../page-header/page-header.md)'s `titleAs`, which is designed for exactly this: a heading component that animates itself *and* renders the heading tag.

## Import
```ts
import { FlipText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| direction | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Which side the new face flips in from (the direction the new face **enters**, not the one the old face leaves towards). |
| splitType | `"char" \| "word"` | `"char"` | Split granularity: `char` per character (CJK-friendly) or `word` on whitespace, which keeps long Latin words from breaking. |
| duration | `number` | `0.5` | Duration of a single character flip, in seconds. |
| stagger | `number` | `30` | Delay between neighbouring characters, in milliseconds. Equivalent to SplitText's `delay`. |
| as | `ElementType` | `"span"` | Rendered tag. Event and attribute types follow it. |

All other native attributes of the rendered tag (`className`, `id`, `data-*`, `ref`, …) are passed through.

## Events

| Event | Type | Description |
|------|------|------|
| onMouseEnter | `(e: MouseEvent<HTMLElement>) => void` | The flip is triggered by this event, but your handler is called **first** and is never replaced. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Heading content. Plain text is extracted recursively before splitting, so **nested markup is flattened**; when no text can be extracted, children render as-is. |

## Example
```tsx
// The heading is the h1, with no wrapper
<FlipText as="h1" className="text-lg font-semibold tracking-tight">System status</FlipText>

// Variables and expressions go straight in (this is why it takes children, not text: string)
<FlipText as="h2">{name || "Untitled customer"}</FlipText>

// As PageHeader's titleAs
<PageHeader title={templateName} titleAs={FlipText} />

// Change direction and slow the wave down
<FlipText direction="left" duration={0.8} stagger={90}>A slower wave</FlipText>

// Split Latin headings on words so long words do not break
<FlipText splitType="word" as="h2">Deploy in seconds</FlipText>
```

## Usage guidelines

- **Do not wrap it in an `<h1>`; use `as`.** `<h1><FlipText/></h1>` is a redundant nesting and makes a screen reader announce two headings: one from the `h1`, one from this component's `aria-label`. Because `as` participates in type inference, `as="h1"` also makes the event and attribute types follow `h1`.
- **Nested markup in `children` is flattened.** Plain text is extracted recursively and then split per character, so `<em>` and friends do not survive. A heading that genuinely needs rich text should not be flipping character by character.
- **One full round; it does not follow hover state.** Moving the pointer away mid-flight would leave characters frozen on an angle, which is visible. Entering plays a complete round, and re-entering while it plays does not restart it.
- **The flip is orthographic, without perspective.** It reads as a flip board rather than a cube. Add `[perspective:800px]` through `className` if you want depth; the back face is already offset by `translateZ(0.5lh)`, half a line box.
- **The back-face character never enters the DOM text.** It is rendered by `[data-hulian-flip-back]::after { content: attr(…) }`, a rule shipped in `preset-core.css`, so the heading's `textContent` is exactly the heading. A real node would make it read "SSyysstteemm", polluting copy-paste and anything a crawler reads. It also means the library preset CSS **must** be loaded, otherwise the second half of the flip is blank.
- Screen readers get the whole sentence rather than loose characters: the root carries an `aria-label` taken from the children text, and every character span is `aria-hidden`. Passing your own `aria-label` overrides it.
- Under `prefers-reduced-motion: reduce` nothing flips and the front face stays put. Both faces render the same character, so the resting state is already the complete heading.

## Related
[SplitText](../split-text/split-text.md) · [BlurText](../blur-text/blur-text.md) · [TextReveal](../text-reveal/text-reveal.md) · [ScrollReveal](../scroll-reveal/scroll-reveal.md) · [WordRotate](../word-rotate/word-rotate.md) · [PageHeader](../page-header/page-header.md) · [Heading](../heading/heading.md)
