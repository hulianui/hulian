---
slug: spotlight
name: Spotlight
category: decoration
group: backdrop
tags: []
exports: [Spotlight]
status: enriched
---

# Spotlight

> Adds a theme-aware radial glow behind foreground content. · decoration/backdrop

## When to Use

Add a soft radial glow to the Hero/Card (focuses the eye, creates atmosphere). If you want to glow, use this component; if you want to regularize the texture, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md) / [StripedPattern](../striped-pattern/striped-pattern.md).

## Import
```ts
import { Spotlight } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | Glow color; any CSS color/variable can be passed (such as `var(--color-success)`) |
| intensity | `number` | `14` | Center-color percentage used by `color-mix`; higher values make the glow brighter |
| x | `string` | `"50%"` | Glow Center X Position |
| y | `string` | `"0%"` | Glow center Y position (top) |
| size | `string` | `"125%"` | Glow ellipse size (radial gradient range) |
| fade | `number` | `55` | The percentage of the position where the background fades out. The smaller the glow, the more concentrated it is |

> Inherited from `ComponentPropsWithoutRef<"div">`.

## Examples
```tsx
<div className="relative grid place-items-center overflow-hidden">
  <Spotlight intensity={18} x="20%" />
  <div className="relative z-10">…Contents…</div>
</div>

<Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16} />
```

## Usage Guidelines

- The internal `absolute inset-0` fills the parent and must be placed inside the `relative` (and usually `overflow-hidden`) positioning container; the overlay content must be `relative z-10` to cover the glow.
- Customize `color` using the token variable (`var(--color-*)`, which must be prefixed with `--color-`) instead of bare `var(--primary)`, otherwise color-mix will not parse it.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
