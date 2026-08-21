---
slug: reveal
name: Reveal
category: decoration
group: overlay-fx
tags: [animated]
exports: [Reveal, Stagger, StaggerItem]
status: enriched
---

# Reveal

> Block reveal primitives · `Reveal` animates displacement, opacity, blur, and scale on mount or viewport entry; `Stagger` and `StaggerItem` sequence child content (Motion runtime · reduced-motion renders the final state) · decoration/overlay-fx · #animated

## When to Use

Use it when any block-level content (card/paragraph/list) wants to float and fade in when it enters the viewport or is mounted, or when multiple items are entered in staggered order. This is a general block-level animation primitive that works on any children; only use ScrollFloat for titles that scroll text character by character, and use BorderBeam / ShineBorder for decorative special effects such as border light strips/gloss.

## Import
```ts
import { Reveal, Stagger, StaggerItem } from "@hulianui/ui"
```

## Props

`Reveal` is shared with `Stagger` (inherits `div` props, and eliminates motion conflicting onDrag*/onAnimationStart):

| Name | Type | Default | Description |
|------|------|------|------|
| trigger | `"in-view" \| "mount"` | `"in-view"` | Play on viewport entry or immediately on mount |
| once | `boolean` | `true` | Whether to play only once when in-view |

**Reveal** (extra):

| Name | Type | Default | Description |
|------|------|------|------|
| y | `number` | `24` | Starting downward movement distance px (floating from bottom) |
| blur | `number` | `8` | Starting blur px (focus pulled in, GPU compositing) |
| scale | `number` | `1` | Start zoom (<1 position like "put on bookshelf") |
| delay | `number` | - | Delay seconds (used for peak staggering of independent blocks; no delay is required for container orchestration in Stagger) |

**Stagger** (extra):

| Name | Type | Default | Description |
|------|------|------|------|
| gap | `number` | `0.08` | Peak offset seconds between sub-items |
| delay | `number` | `0` | The entire group of starting delay seconds |

**StaggerItem** (inherits `div` props, eliminates motion conflict items):

| Name | Type | Default | Description |
|------|------|------|------|
| y | `number` | `18` | Starting downward movement distance px |
| blur | `number` | `8` | Start blur px |
| scale | `number` | `1` | Start zoom (<1 like "Put on bookshelf") |

## Examples
```tsx
// Single block: float and focus into place on mount.
<Reveal trigger="mount" y={24} blur={8} scale={1}>
  <div className="card">Floating content</div>
</Reveal>

// Sequence items by gap and emphasize the final item with blur and scale.
<Stagger trigger="mount" gap={0.1}>
  <div className="flex flex-col gap-3">
    <StaggerItem><Card>First item</Card></StaggerItem>
    <StaggerItem><Card>Second item</Card></StaggerItem>
    <StaggerItem y={22} scale={0.94} blur={12}><Card>Final item</Card></StaggerItem>
  </div>
</Stagger>
```

## Usage Guidelines

- Let `Stagger` coordinate timing for its `StaggerItem` children. Use `Reveal.delay` only when sequencing independent reveal blocks.
- This is the client component of motion runtime (including `"use client"`): it is already the client boundary in Next.js App Router, and can be combined normally according to the server/client boundary. There is no need to upgrade the entire parent layout to client for it.
- Directly render the final state (visible, not blurry) under reduced-motion. Do not use the entry animation as a switch for content visibility.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
