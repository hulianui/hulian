---
slug: text-reveal
name: TextReveal
category: typography
group: text
tags: [animated]
exports: [TextReveal]
status: enriched
---

# TextReveal

> Sweeping reveal · a multicolour band sweeps across and turns the text from transparent to solid as it passes · `repeat` loops it to mean "in progress", multiple strings rotate while the box reserves the widest one so nothing jumps, reduced motion falls back to the finished state instead of erasing the text, and it ships as pure CSS keyframes with no motion runtime · typography/text · #animated

## When to use

There are two ways to use it, and the second one is why it exists:

1. **Entrance** — one sweep as the text scrolls into view, resting fully revealed (the default).
2. **An "in progress" status label** — `repeat` keeps it sweeping while a long background task advances ("Running OCR", "Parsing", "Archiving").

The second case was the gap: every other text effect in the library is a one-shot entrance that plays and rests. For a progress label, **the animation stopping is itself an error signal** — the user reads "still moving" as "the backend is still alive" (#255).

How it differs from its neighbours: [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) adds a single-colour highlight over text that is **already visible** and never reveals it from transparent; [StreamingText](../streaming-text/streaming-text.md) means "tokens are arriving" and needs the parent to grow the string, while this component's copy is a **fully known** stage name; [SplitText](../split-text/split-text.md) and [BlurText](../blur-text/blur-text.md) are entrances.

## Import
```ts
import { TextReveal } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text * | `string \| string[]` | — | The copy to reveal. An array rotates through the strings (pair it with `repeat`), and the box reserves the width of the widest one. |
| colors | `string[]` | chart-1..5 | Colours of the sweeping band; theme-aware. A single entry gives a single-colour band. |
| textColor | `string` | `var(--color-foreground)` | Colour of the revealed text. **Never pass `currentColor`** — see the guidelines. |
| duration | `number` | `2` | Seconds for one full sweep. |
| repeat | `boolean` | `false` | Keep sweeping. Required for the "in progress" meaning. |
| startOnView | `boolean` | `true` | Start when scrolled into view. Pass `false` for labels that already sit in the viewport, such as a sidebar. |
| once | `boolean` | `true` | Sweep only once; `false` replays every time it scrolls back into view. Only meaningful when `startOnView` is `true`. |

All other native `<span>` attributes (`className`, `title`, `style`, …) are passed through.

## Example
```tsx
// The stage name of a long background task: keeps sweeping until the task ends
<TextReveal text={statusTag} repeat startOnView={false} />

// Rotating strings; the box reserves the widest, so neighbours never jump
<TextReveal text={["Running OCR", "Parsing", "Archiving"]} repeat startOnView={false} />

// Entrance: reveal once on scroll
<TextReveal text="Ship faster, safer, prettier" className="text-2xl font-bold" />

// Single-colour band, faster sweep
<TextReveal text="Syncing" colors={["var(--color-primary)"]} duration={1.2} repeat startOnView={false} />
```

## Usage guidelines

- **Never pass `currentColor` as `textColor`.** The text itself is `color: transparent` — the background gradient shows through the glyphs — so `currentColor` resolves to that transparent and the whole string disappears. To follow the container, pass an explicit token such as `textColor="var(--color-primary)"`.
- **Colour variables need the `--color-` prefix.** That is the real name in this library's `@theme`; a bare `var(--primary)` or `var(--chart-1)` does not resolve inside the gradient.
- **The "in progress" usage requires `repeat`.** Without it the sweep runs once and rests, which reads as ordinary static text — and the whole information content of such a label is that it is *still moving*.
- **Reduced motion does not erase the text.** The animation uses `fill-mode: both`, so under `prefers-reduced-motion: reduce` the animation simply does not exist and the element falls back to its static `background-position`, which paints the whole string in `textColor`. This is structural, not a JavaScript fallback that seeks the sweep to its end.
- **Width reservation for rotating strings works by stacking every string in the same grid cell**, so nothing is measured or hard-coded and it stays correct across fonts and sizes. The placeholder strings carry their copy in `data-hulian-ghost-text` and render it from a pseudo-element, keeping it out of the DOM text — otherwise the label's `textContent` would be every stage name concatenated. This relies on the library preset CSS, which a normal setup already loads.
- With a single string the width follows the content, exactly like plain text. If a parent switches stage names and you want a fixed width, pass every possible name as an array, or add a `min-w-*` through `className`.

## Related
[AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [StreamingText](../streaming-text/streaming-text.md) · [SplitText](../split-text/split-text.md) · [BlurText](../blur-text/blur-text.md) · [FlipText](../flip-text/flip-text.md) · [WordRotate](../word-rotate/word-rotate.md) · [Spinner](../spinner/spinner.md)
