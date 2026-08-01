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

> Spotlight card · Mouse follows radial highlight (pure CSS variable + radial-gradient) + color-mix highlight color + surface token (zero dependency) · decoration/overlay-fx · #animated

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
| color | `string` | chart-1 token | Spotlight color, accepts any CSS color string, such as `"#7c3aed"`, `"var(--color-primary)"`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Card content. |

## Examples
```tsx
<CardSpotlight color="var(--color-primary)" radius={350} className="w-64">
  <div className="mb-3 text-3xl">⚡</div>
<h3 className="mb-1.5 text-base font-semibold"> theme color highlight </h3>
<p className="text-sm text-muted">color passes var(--color-primary), and the highlight is linked with the theme. </p>
</CardSpotlight>
```

## Usage Guidelines

- `color` If you want to link it with the theme, you must bring the `--color-` prefix (such as `var(--color-primary)`) when passing CSS variables. The bare `var(--primary)` will not be parsed under Tailwind v4 `@theme`.
- Highlight is a client-side effect of pointer following. Highlight is not displayed in pure SSR/no pointer (touch screen) environment, which is an expected downgrade.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
