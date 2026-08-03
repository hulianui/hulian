---
slug: ballpit
name: Ballpit
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Ballpit]
status: enriched
---

# Ballpit

> Ball pit · Interactive Canvas 2D balls with gravity, wall bounce, elastic collisions, and pointer repulsion · Theme colors and a reduced-motion fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for a playful, responsive backdrop in a landing-page hero, empty state, or brand play area. Use [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md) for static regular texture, and [Balatro](../balatro/balatro.md) for a painted flow field. Ballpit runs an interactive O(n²) collision simulation, so large counts can reduce frame rate.

## Import
```ts
import { Ballpit } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| count | `number` | `80` | Maximum ball count; the component reduces it for small containers. Collision cost is O(n²), so keep it at or below 200 |
| colors | `string[]` | chart token ×5 | Ball color matching, circularly allocated according to index; any CSS color string can be passed, the default is light and dark theme |
| gravity | `number` | `900` | Gravity in px/s²; `0` floats weightlessly, while higher values fall faster |
| bounce | `number` | `0.86` | Wall/collision energy retention coefficient (0–1); 1 = completely elastic and never stops |
| sizeRange | `[number, number]` | `[10, 26]` | Ball radius range [minimum, maximum] (px); also constrained by the short side of the container |
| followCursor | `boolean` | `true` | Treat the pointer as a repulsive ball; disable it to remove pointer interaction |
| className | `string` | — | Class name forwarded to the root, which includes `absolute inset-0 z-0` |
| style | `CSSProperties` | — | Inline styles passed through to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static bottom when there is no canvas (default is a set of statically arranged small balls) |

## Examples
```tsx
//Default ball pool: placed in the relative container, move the cursor to push the ball away
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Ballpit />
</div>
```
```tsx
// Weightless floating + completely elastic
<Ballpit gravity={0} bounce={1} count={60} />
```

## Usage Guidelines

- **Ball count versus container area**: `count` is a ceiling. The component reduces it until total ball area is about 42% or less of the container. Forcing many large balls into a narrow card, such as `count=28` with radii in `[24,44]`, causes overlap jitter; let the component adapt or lower `count` or `sizeRange`.
- **O(n²) collision**: If the number of balls is too large (>200), real-time collision detection will be stuck. For background scenes, it is recommended to have multiple balls with a small radius instead of large balls.
- **Client rendering**: Canvas 2D and `requestAnimationFrame` run only in the browser. SSR renders the static `fallback`; do not mount realtime logic in a server component.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
