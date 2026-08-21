---
slug: falling-text
name: FallingText
category: typography
group: text
tags: [animated]
exports: [FallingText]
status: enriched
---

# FallingText

> Falling text · Words become draggable 2D rigid bodies that fall, collide, bounce, and stack, with a dependency-free rAF engine and reduced-motion fallback · typography/text · #animated

## When to use

Use FallingText for a landing-page easter egg or interactive banner where a short sentence falls apart and can be dragged. Use ScrollFloat or Reveal for a gentle entrance. FallingText treats every word as a rigid body, so reserve it for short decorative copy.

## Import
```ts
import { FallingText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | `""` | For the entire text, press the space to cut into "word chunks", and each word will have an independent rigid body dropped. |
| highlightWords | `string[]` | `[]` | Words to be highlighted (prefix matching: word startsWith, any one will be highlighted) |
| highlightClass | `string` | `"text-primary font-semibold"` | Highlighted word additional className (superimposed on the word chunk) |
| trigger | `"auto" \| "scroll" \| "click" \| "hover"` | `"auto"` | Drop timing: play when mounted/scroll into the viewport/click the container/move the pointer in |
| gravity | `number` | `1` | Downward acceleration coefficient, the larger it is, the faster it falls and the faster it stacks. It is recommended to be 0.3-3. |
| bounce | `number` | `0.6` | Rebound coefficient after landing/hitting wall (0 means no bounce, 1 means full bounce) |
| fontSize | `string` | `"1.5rem"` | Text font size (CSS length, passed in root fontSize) |
| className | `string` | - | supports root container extra className |
| style | `CSSProperties` | - | supports root container inline styles |

## Examples
```tsx
// Default: automatic fall with highlighted words
<FallingText
  text="HulianUI component library enterprise-level high-quality native adaptation token theme"
  highlightWords={["HulianUI", "token"]}
  className="text-white/90"
  fontSize="1.5rem"
/>

// Click trigger with high gravity and low bounce for quick stacking
<FallingText text="Click me to let the words scatter down" trigger="click" gravity={2.4} bounce={0.2} />
```

## Usage guidelines

- Words are split on spaces. Languages without spaces need manual segmentation, such as `"HulianUI Component library Enterprise level"`; otherwise the whole sentence becomes one body.
- `highlightWords` uses prefix matching (`startsWith`), not exact equality, so related prefixes may match unintentionally.
- By default, `text=""` does not render any words. If you forget to pass text, you will get an empty stage.
- Reduced-motion mode disables the physics animation. Do not rely on motion to communicate core content.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
