---
slug: card-spotlight
name: CardSpotlight
category: decoration
group: overlay-fx
tags: [animated]
exports: [CardSpotlight]
status: enriched
---

# CardSpotlight

> Spotlight card · Pointer-following radial highlight powered by CSS variables, `radial-gradient`, `color-mix`, and surface tokens · No runtime dependency · decoration/overlay-fx · #animated

## When to Use

Wrap feature, work, or pricing-card content when a soft pointer-following radial highlight should make the surface feel responsive. The spotlight is anchored to the card. Use [BorderBeam](../border-beam/border-beam.md) for a moving border highlight, [GlareHover](../glare-hover/glare-hover.md) for a sweeping reflection, or [Lens](../lens/lens.md) to magnify local content.

## Import
```ts
import { CardSpotlight } from "@hulianui/ui"
```

## Props

Extends `HTMLAttributes<HTMLDivElement>`, forwarding `className`, `style`, `onClick`, and other native attributes.

| Name | Type | Default | Description |
|------|------|------|------|
| radius | `number` | `350` | Spotlight radius in pixels; higher values spread the highlight and lower values focus it |
| color | `string` | chart-1 token | Spotlight color; accepts any CSS color such as `"#7c3aed"` or `"var(--color-primary)"` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Card content |

## Examples
```tsx
<CardSpotlight color="var(--color-primary)" radius={350} className="w-64">
  <div className="mb-3 text-3xl">⚡</div>
  <h3 className="mb-1.5 text-base font-semibold">Theme-aware highlight</h3>
  <p className="text-sm text-muted-foreground">The spotlight follows the active primary color.</p>
</CardSpotlight>
```

## Usage Guidelines

- To follow the active theme, pass a CSS variable with the `--color-` prefix, such as `var(--color-primary)`. Tailwind v4 does not expose bare names such as `var(--primary)` here.
- The spotlight tracks pointer movement on the client. It remains inactive during SSR and on devices without a pointer; the card content still renders normally.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
