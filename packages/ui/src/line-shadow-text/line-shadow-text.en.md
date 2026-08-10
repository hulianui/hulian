---
slug: line-shadow-text
name: LineShadowText
category: typography
group: text
tags: []
exports: [LineShadowText]
status: enriched
---

# LineShadowText

> Line-shadow text · Hard-edged striped offset layer, static by default, RSC-safe · typography/text

## When to use

Use LineShadowText to give a two-to-four word brand phrase or hero heading a hard-edged diagonal shadow. It is the **most restrained** member of the text-effect family: static by default, no animation frame loop, pure CSS — so print pages, corporate sites, and `prefers-reduced-motion` environments can all use it.

For a flowing gradient use [AuroraText](../aurora-text/aurora-text.md), for a sweeping highlight use [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md), and for per-character entrances use [SplitText](../split-text/split-text.md). Use [Text](../text/text.md) for ordinary copy.

## Import
```ts
import { LineShadowText } from "@hulianui/ui"
```

## Props

Inherits the native `<span>` attributes; `children` is narrowed below.

| Name | Type | Default | Description |
|------|------|------|------|
| children * | `string` | — | Text to shadow. **Strings only**: the shadow layer is a copy of the same text, and non-text nodes cannot be reproduced. |
| shadowColor | `string` | `var(--color-foreground)` | Shadow color. Tokens need the `--color-` prefix; a bare `var(--primary)` does not resolve under Tailwind v4's `@theme`. |
| offset | `string` | `"0.04em"` | Shadow offset from the text. Using `em` keeps it proportional to the font size. |
| lineWidth | `string` | `"0.06em"` | Stripe thickness and spacing. Larger values give coarse stripes, smaller ones approach a solid shadow. |
| animated | `boolean` | `false` | Drifts the stripes along the diagonal. See Usage guidelines for why this is off by default. |
| duration | `string` | `"15s"` | Seconds per drift cycle; only effective while `animated` is true. |

## Examples
```tsx
<LineShadowText className="text-5xl font-bold">Hulian</LineShadowText>
```
```tsx
{/* Shadow in the primary color */}
<LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
  Hulian
</LineShadowText>
```
```tsx
{/* Accent only the brand word inside a hero heading */}
<h1 className="text-4xl font-bold text-foreground">
  Build admin apps with <LineShadowText shadowColor="var(--color-primary)">Hulian</LineShadowText>
</h1>
```

## Usage guidelines

- **Static by default is deliberate**, not unfinished. The value of this preset is precisely "design flourish without motion"; making `animated` the default would erase what separates it from the rest of the family. Even when enabled, the animation still respects `prefers-reduced-motion`.
- **`children` accepts strings only.** The shadow layer renders the same text again and clips the stripes to the glyphs with `bg-clip-text`; passing an icon or nested element only produces visual noise. Use another effect for rich nodes.
- The shadow layer is a **real DOM node marked `aria-hidden`**, not `::after` with `content: attr(data-text)`. Some screen readers announce pseudo-element content, which reads the same word twice; a real node can be marked decorative explicitly.
- Do not apply it to long body copy: at small sizes the stripes blur into a grey fringe, and every glyph carries an extra paint.
- Do not hard-code the shadow as `black` (the upstream default): under a dark theme that is an invisible black smudge. Use a token.

## Related
[AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [SparklesText](../sparkles-text/sparkles-text.md) · [GlitchText](../glitch-text/glitch-text.md) · [SplitText](../split-text/split-text.md) · [Text](../text/text.md)
