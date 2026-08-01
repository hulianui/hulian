---
slug: star-border
name: StarBorder
category: decoration
group: overlay-fx
tags: [animated]
exports: [StarBorder]
status: enriched
---

# StarBorder

> Meteor-stroke button · Two radial-gradient light bands sweep around the edge (pure CSS · zero dependencies · RSC-safe) + token color + polymorphic `as` + reduced-motion pause · decoration/overlay-fx · #animated

## When to Use

Use it when you need a CTA button/link with a glowing stroke that attracts clicks. Compared with [BorderBeam](../border-beam/border-beam.md)/[ShineBorder](../shine-border/shine-border.md) packages that "add border light effects to any card container", StarBorder comes with button semantics (the default rendering is `<button>`, and the inner shell is the button skin), which can be used directly as a button; if you just want to illuminate an existing piece of content without a button, use ShineBorder/BorderBeam.

## Import
```ts
import { StarBorder } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| as | `ElementType` | `"button"` | Render root tag, `"a"`/`"div"`/any component can be passed; DOM attributes are transparently passed to the element |
| color | `string` | `var(--color-primary)` | Meteor light band color, fed into radial-gradient; any CSS color (hex/oklch/var(--…)) can be used |
| speed | `number` | `6` | The duration of a single meteor sweep (seconds), the bigger, the slower, the more restrained |
| thickness | `number` | `1` | Border light strip thickness (px), open the top and bottom padding of the root container to determine the stroke thickness |
| className | `string` | — | Forward the additional class name of the root container (merged, can cover rounded corners/spacing) |
| style | `CSSProperties` | — | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button/container content |

## Examples
```tsx
// Main color light strip button
<StarBorder>Start now</StarBorder>

// Polymorphic link with a custom color and faster sweep.
<StarBorder as="a" href="/docs" color="var(--color-chart-2)" speed={3}>
  View documentation →
</StarBorder>
```

## Usage Guidelines

- When customizing `color` token, be sure to bring the `--color-` prefix (such as `var(--color-chart-3)`). The bare `var(--primary)` does not resolve under Tailwind v4. See [[hulian-token-color-var-needs-color-prefix]].
- The reduced-motion light band automatically stops (does not move but the stroke is still there), no additional processing is required.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
