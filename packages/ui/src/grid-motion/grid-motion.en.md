---
slug: grid-motion
name: GridMotion
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GridMotion]
status: enriched
---

# GridMotion

> Tilt grid parallax · Background · Pointer traverse odd and even inverse elastic tracking of each line + central radial glow (zero dependency motion useSpring·token·reduced-motion) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need to lay out pictures/texts/icons into a tilted grid and create a hero background with odd and even rows of reverse parallax as the pointer moves horizontally. For a purely geometric grid pattern (no content, no parallax) use [GridPattern](../grid-pattern/grid-pattern.md); for a retro perspective grid with vanishing points use [RetroGrid](../retro-grid/retro-grid.md).

## Import
```ts
import { GridMotion } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `ReactNode[]` | Placeholder text "Item N" | Grid cell content. Strings starting with `http` are treated as image URLs; other strings are rendered as text, and React nodes render directly. Items beyond rows × columns are truncated, while missing cells use placeholders. |
| rows | `number` | `4` | Number of grid rows, each row is an independent parallax translation unit (odd and even rows are reversed) |
| columns | `number` | `7` | Number of grid columns |
| gradientColor | `string` | `var(--color-primary)` | Center radial halo color, fading outward from the center of the canvas |
| maxMoveAmount | `number` | `300` | The maximum translation amplitude (px) of each line when the pointer moves horizontally. The larger the parallax, the more exaggerated it is |
| rotate | `number` | `-15` | The overall rotation angle (deg) of the grid to create a perspective bevel |
| className | `string` | - | Root container className |
| style | `CSSProperties` | - | Forward the root container inline style |

## Examples
```tsx
// The container needs to be relative + overflow-hidden + fixed height, and the component should be filled with absolute inset-0
<div className="relative h-72 overflow-hidden rounded-xl">
  <GridMotion className="absolute inset-0" />
</div>
```
```tsx
// Custom text + warm glow
<GridMotion
  className="absolute inset-0"
  gradientColor="var(--color-chart-1)"
  items={Array.from({ length: 28 }, (_, i) => WORDS[i % WORDS.length])}
/>
```

## Usage Guidelines

- The parent needs `relative`, `overflow-hidden`, and an explicit height. Fill it with `absolute inset-0`; without a height, the grid is not visible.
- Parallax and the halo use `useSpring` on the client, so the first SSR frame is static. Reduced-motion preferences disable the parallax.
- CSS-variable values for `gradientColor` need the `--color-` prefix, such as `var(--color-chart-1)`. Bare `var(--primary)` cannot be resolved; see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
