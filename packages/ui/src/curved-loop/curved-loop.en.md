---
slug: curved-loop
name: CurvedLoop
category: typography
group: text
tags: [animated]
exports: [CurvedLoop]
status: enriched
---

# CurvedLoop

> Arc marquee · Arc marquee text that scrolls seamlessly along the quadratic Bezier curve · SVG textPath + rAF continuous scroll + draggable toggle (zero dependency·token/currentColor·reduced-motion) · typography/text · #animated

## When to use

Use CurvedLoop for an arced marquee in a hero or section divider. Choose ScrollVelocity for multiple horizontal rows that accelerate or reverse with page scrolling. Choose CurvedLoop when one curved text strip should loop seamlessly and allow manual dragging.

## Import
```ts
import { CurvedLoop } from "@hulianui/ui"
```

## Props

Inherits `SVGProps<SVGSVGElement>` (removes `ref`), commonly used as follows:

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | `"\u745a\u740f \u00b7 HULIAN \u00b7 "` | Marquee text. The built-in Chinese copy begins with “Hulian”; trailing whitespace is trimmed, non-breaking spaces separate phrases, and the ends are joined to fill the curve seamlessly. |
| speed | `number` | `2` | Scroll speed in pixels per frame at roughly 60fps; larger values move faster. |
| curveAmount | `number` | `320` | Vertical offset of the quadratic Bézier control point in viewBox pixels. Positive values curve down, negative values curve up, and 0 is nearly straight. |
| direction | `"left" \| "right"` | `"left"` | Automatic scrolling direction. |
| interactive | `boolean` | `true` | Enables mouse and touch dragging; after release, scrolling continues in the drag direction. |
| className | `string` | - | Text-color class such as `text-primary`; the default fill uses `currentColor` from this class or the parent. |

## Examples
```tsx
// Default: curve downward and scroll left
<CurvedLoop text="HulianUI · HULIAN · " className="text-white" />

// Curve upward with a negative curveAmount and use the primary chart color
<CurvedLoop text="ENTERPRISE UI · " curveAmount={-220} className="text-[var(--color-chart-1)]" />

// Scroll right quickly with dragging disabled
<CurvedLoop text="HulianUI component library · " direction="right" speed={4} interactive={false} />
```

## Usage guidelines

- End `text` with a separator such as `" · "`. The component inserts non-breaking spacing before joining the end to the start; without a separator, the loop seam reads as one merged phrase.
- Color inherits `currentColor`. Set it with a `text-*` class on `className` instead of passing `fill` directly.
- Reduced-motion mode stops automatic scrolling but keeps manual dragging available. Do not make the animation the only carrier of important information.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
