---
slug: decrypted-text
name: DecryptedText
category: typography
group: text
tags: [animated]
exports: [DecryptedText]
status: enriched
---

# DecryptedText

> Decrypted text · Characters scramble and resolve into readable text on view or hover, with client-only randomness, stable widths, and a plain-text aria-label · typography/text · #animated

## When to use

Use DecryptedText for a technical or security-themed reveal that scrambles characters before resolving them. Use [BlurText](../blur-text/blur-text.md) for a soft focus transition, [GlitchText](../glitch-text/glitch-text.md) for RGB tearing, or [SplitText](../split-text/split-text.md) for a straightforward staggered entrance.

## Import
```ts
import { DecryptedText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text * | `string` | - | target plaintext |
| speed | `number` | `55` | The interval between each garbled refresh is milliseconds |
| animateOn | `"view" \| "hover"` | `"view"` | Trigger method: view scrolls into the viewport and decodes it once/hover decodes it and resets it when it moves out. |
| characters | `string` | Uppercase and lowercase letters + numbers + symbols | Garbled sampling character set |

The remaining `<span>` native properties support.

## Examples
```tsx
<DecryptedText text="Decrypting access..." className="text-2xl font-semibold text-foreground" />

<DecryptedText
  text="Hover to decrypt"
  animateOn="hover"
  className="text-2xl font-semibold text-primary"
/>
```

## Usage guidelines

- Random scrambling starts in a client effect to avoid SSR/hydration mismatches; the server-rendered first frame is readable text.
- The component uses `tabular-nums` to limit width jitter. Do not override that width behavior through `className`, or characters may jump as they change.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
