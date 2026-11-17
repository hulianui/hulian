---
slug: fade-mask
name: FadeMask
category: decoration
group: backdrop
tags: []
exports: [FadeMask]
status: enriched
---

# FadeMask

> Fades content out to transparency toward one edge or from the center outward. · decoration/backdrop

## When to use

Fading out the bottom of a bleeding showcase wall, spotlighting the center of a dot or grid texture, or fading both ends of a horizontal scroller. It uses a CSS mask, so it doesn't care what background sits underneath and works on cards and dark sections alike. For a blur gradient use [ProgressiveBlur](../progressive-blur/progressive-blur.md); for a glow use [Spotlight](../spotlight/spotlight.md).

## Import
```ts
import { FadeMask } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| direction | `"top" \| "bottom" \| "left" \| "right" \| "radial"` | `"bottom"` | Which edge to fade toward; `radial` fades outward from `at` |
| start | `string` | `"60%"` (radial `"0%"`) | Linear: where the fade begins (fully opaque before it). Radial: the share of the radius that stays fully opaque |
| at | `string` | `"50% 50%"` | Radial: the center of the fade |
| size | `string` | `"50% 50%"` | Radial: the extent of the fade (width height) |

> Extends native `<div>` attributes (use `className` for positioning and size).

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | The content to fade |

## Examples
```tsx
// Fade out the bottom of a showcase wall
<FadeMask direction="bottom" start="72%" className="absolute inset-y-0 left-0 w-screen">
  <Card>…</Card>
</FadeMask>

// Spotlight the center of a dot texture
<FadeMask direction="radial" at="30% 10%" size="40% 50%" className="absolute inset-0 -z-10">
  <DotPattern />
</FadeMask>
```

## Pitfalls

- The mask applies to the whole subtree: clickable elements stay clickable even where they've faded to transparent, so keep interactive controls out of the fully transparent part.
- When wrapping an `absolute inset-0` background such as DotPattern, give FadeMask its own position and size (for example `absolute inset-0`); otherwise the background aligns to an outer positioned ancestor.

## Related
[Spotlight](../spotlight/spotlight.md) · [DotPattern](../dot-pattern/dot-pattern.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
