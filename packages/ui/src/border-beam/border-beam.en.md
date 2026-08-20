---
slug: border-beam
name: BorderBeam
category: decoration
group: overlay-fx
tags: [animated]
exports: [BorderBeam]
status: enriched
---

# BorderBeam

> Frame beam · motion offsetPath around the edge + mask only the frame · decoration/overlay-fx · #animated

## When to Use

Use it to run a compact colored highlight around a card or container border for emphasis, loading, or an active AI state. It is an absolutely positioned overlay and needs a `relative` container. Use [ShineBorder](../shine-border/shine-border.md) for a continuous gradient around the whole border, [AnimatedBeam](../animated-beam/animated-beam.md) to connect two elements, or [GlareHover](../glare-hover/glare-hover.md) for a diagonal hover reflection.

## Import
```ts
import { BorderBeam } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `number` | `50` | Beam square side length px (default demonstration uses 60) |
| duration | `number` | `6` | Number of seconds for one round |
| delay | `number` | `0` | Start delay seconds |
| colorFrom | `string` | `var(--color-primary)` | Beam start color |
| colorTo | `string` | `var(--color-chart-2)` | Beam stop color |
| reverse | `boolean` | `false` | Move around the border in reverse |
| initialOffset | `number` | `0` | Starting offset 0–100 |
| borderWidth | `number` | `1` | border width px |
| className | `string` | — | Class name forwarded to the overlay |
| style | `CSSProperties` | — | Inline style forwarded to the overlay |

## Examples

```tsx
// Must be put into relative + overflow-hidden container
<div className="relative overflow-hidden rounded-xl border bg-surface">
  ...content
  <BorderBeam />
</div>
```

```tsx
<div className="relative overflow-hidden rounded-xl">
  ...content
  <BorderBeam reverse duration={10} size={80} />
</div>
```

## Usage Guidelines

- It must be placed in a `position:relative` container, and the container is generally `overflow-hidden`, otherwise the beam will go around the rounded corners and overflow.
- The color prop needs to be prefixed with `--color-` when feeding the token (the default value is already included). The bare `var(--primary)` does not resolve - see [[hulian-token-color-var-needs-color-prefix]].
- Renders nothing when the system prefers reduced motion. The beam is a purely decorative layer (`absolute inset-0 pointer-events-none`), so skipping it neither shifts layout nor drops information; freezing it mid-path would instead read as a rendering artifact.

## Related
[ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
