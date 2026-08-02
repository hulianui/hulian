---
slug: glitch-text
name: GlitchText
category: typography
group: text
tags: [animated]
exports: [GlitchText]
status: enriched
---

# GlitchText

> Glitch text · RGB-offset pseudo-elements and clip-path slice jitter in pure CSS, with chart-token colors, hover gating, RSC support, and reduced-motion fallback · typography/text · #animated

## When to use

Use GlitchText for a cyberpunk or technical heading with RGB offsets and sliced jitter. The effect is pure CSS with no runtime dependency and renders in an RSC. Use [DecryptedText](../decrypted-text/decrypted-text.md) for a character-decoding reveal, [BlurText](../blur-text/blur-text.md) for focus, or [Heading](../heading/heading.md) for static text.

## Import
```ts
import { GlitchText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | `number` | `2.5` | Tear cycle seconds, the smaller it is, the more violent it is |
| enableOnHover | `boolean` | `false` | Fault only on hover, rest as normal text; default permanent fault |

The remaining `<span>` native properties support.

## Slots

| Slot | Type | Description |
|------|------|------|
| children * | `string` | The text to be used for the tearing fault effect must be a pure string (copied by the pseudo element `attr(data-text)`) |

## Examples
```tsx
<GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>

<GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
  GLITCH
</GlitchText>
```

## Usage guidelines

- `children` must be a plain string. Pseudo-elements copy it through `attr(data-text)`; JSX leaves the offset layers empty.
- Glitch colors use chart tokens such as `var(--color-chart-*)` and follow the theme. Custom colors need a `--color-` token or another valid CSS color; bare `var(--primary)` is not resolved by this Tailwind v4 setup.
- With `prefers-reduced-motion`, the component falls back to stable ordinary text.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
