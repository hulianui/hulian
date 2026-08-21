---
slug: target-cursor
name: TargetCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [TargetCursor]
status: enriched
---

# TargetCursor

> Targeting cursor · Center dot + rotating corner brackets that expand around matching hover targets (rAF interpolation instead of GSAP · token color · reduced-motion support) · decoration/overlay-fx · #animated

## When to Use

If you want to put a crosshair-style custom cursor on a page/a certain area, and the four-corner brackets will automatically frame the target element when you hover it, it can be used for gamification or dazzling interaction. It takes over the cursor itself; if you just want an element to glow/deform on hover (without changing the cursor), use [GlareHover](../glare-hover/glare-hover.md); for a partial magnifier that the mouse follows, use [Lens](../lens/lens.md).

## Import
```ts
import { TargetCursor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| targetSelector | `string` | `".cursor-target"` | A CSS selector that hits the target and expands the square brackets around the matching element when hovering it |
| spinDuration | `number` | `2` | The number of seconds it takes for the idle square bracket to rotate around the center. The smaller the number, the faster |
| hideDefaultCursor | `boolean` | `true` | Whether to hide the system default cursor (container scope only hides the parent container; fullScreen takes over the body cursor, uninstall and restore) |
| fullScreen | `boolean` | `false` | Uses a fixed viewport-wide cursor and window-level listeners; the default container scope is absolutely positioned, hides on leave, and supports multiple instances |
| color | `string` | `var(--color-foreground)` | Cursor main color (dot background + four-corner stroke), must be parsed with `--color-` prefix |
| hoverDuration | `number` | `0.2` | The easing follow time of the target wrapped in square brackets (seconds), the larger it is, the "stickier" it is |
| className | `string` | - | Forward the additional class name of the root container |
| style | `CSSProperties` | - | Forward the root container inline style |

## Examples
```tsx
//Container scope: limit the crosshair to a certain area, move it into .cursor-target and it will be framed
<div className="relative">
  <div className="cursor-target">Aim at me</div>
  <TargetCursor />
</div>

// Main color + fast rotation + sticky wrap
<TargetCursor color="var(--color-primary)" spinDuration={0.8} hoverDuration={0.6} />
```

## Usage Guidelines

- The `color` token must be prefixed with `--color-` (such as `var(--color-primary)`), and bare `var(--primary)` does not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Container scope requires the parent element to be a positioning context; if the parent element is `position: static`, the component will fill in `position: relative` in place and restore it when unloading - don't rely on the static positioning of the parent element itself.
- `fullScreen` mode takes over the cursor of `document.body`, and only one instance should be placed on the entire page; only multiple instances can coexist in the container scope.
- Monitoring the hanging window/container and hiding the system cursor are browser behaviors and must be run by the client (the component is marked `"use client"`).

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
