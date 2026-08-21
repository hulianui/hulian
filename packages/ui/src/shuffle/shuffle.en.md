---
slug: shuffle
name: Shuffle
category: typography
group: text
tags: [animated]
exports: [Shuffle]
status: enriched
---

# Shuffle

> Scramble-and-resolve text · characters cycle through a scramble set, then lock to their final values in directional order + viewport, hover, and loop triggers · dependency-free rAF + reduced-motion fallback · typography/text · #animated

## When to use

Use Shuffle for a terminal- or decryption-style title that scrambles and then resolves character by character. Use [TextPressure](../text-pressure/text-pressure.md) for pointer-distance deformation, [AuroraText](../aurora-text/aurora-text.md) for a flowing gradient, or [Text](../text/text.md) for ordinary static copy.

## Import
```ts
import { Shuffle } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text* | `string` | - | The final rendered text (the parsing target) |
| duration | `number` | `0.6` | Total animation duration in seconds; each character's resolve point is based on its index. |
| shuffleDirection | `"left" \| "right"` | `"right"` | Resolve order: `left` resolves right-to-left; `right` resolves left-to-right. |
| scrambleCharset | `string` | Uppercase letters + numbers + a few symbols | Before parsing, each character is randomly selected and flashes into a garbled character set. |
| loop | `boolean` | `false` | Whether to clear the rewash cycle after parsing is completed |
| loopDelay | `number` | `1` | Loop interval (seconds, only valid when looping) |
| triggerOnView | `boolean` | `true` | Triggered only when entering the viewport (IntersectionObserver) |
| triggerOnce | `boolean` | `true` | Whether triggerOnView is only triggered once when entering the viewport |
| triggerOnHover | `boolean` | `false` | Reshuffle the cards when the mouse moves in (the animation will only respond when it is idle) |
| tag | `"p" \| "span" \| "div" \| "h1" \| "h2" \| "h3" \| "h4"` | `"p"` | render tag |
| textAlign | `CSSProperties["textAlign"]` | `"center"` | text alignment |
| className | `string` | - | The class name merged into the root element |
| style | `CSSProperties` | - | Inline styles (merged with textAlign) |

## Events

| Event | Type | Description |
|------|------|------|
| onShuffleComplete | `() => void` | Parsing completion callback (triggered at the end of each round when looping) |

## Example
```tsx
// Reshuffle on hover instead of viewport entry
<Shuffle
  text="HULIAN"
  triggerOnView={false}
  triggerOnHover
  className="text-3xl font-semibold tracking-wide"
/>

// Loop with a hexadecimal character set
<Shuffle
  text="0xC0FFEE"
  loop
  loopDelay={1.2}
  scrambleCharset="0123456789ABCDEF"
  duration={0.7}
  triggerOnView={false}
/>
```

## Usage guidelines

- `triggerOnView` defaults to true, so the animation waits for viewport entry. Set `triggerOnView={false}` on a fixed demo stage when it should start by another trigger.
- `triggerOnHover` responds only while idle; hovering during an active shuffle does not restart or interrupt it.
- Reduced-motion mode renders the final text immediately without scrambling.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
