---
slug: image-trail
name: ImageTrail
category: decoration
group: overlay-fx
tags: [animated]
exports: [ImageTrail]
status: enriched
---

# ImageTrail

> Cursor image trailing · Cursor trailing image component · Move the cursor along the trajectory and throw out the images one by one, fade in and follow, shrink and fade out (zero dependency RAF+lerp·token·reduced-motion) · decoration/overlay-fx · #animated

## When to Use

Use it to place a sequence of supplied images along the pointer path, such as portfolio thumbnails or product shots in a landing-page hero. Use [GhostCursor](../ghost-cursor/ghost-cursor.md) for an abstract smoke trail instead. The root is a `relative overflow-hidden` capture region, and `images` is required.

## Import
```ts
import { ImageTrail } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| images* | `string[]` | — | A list of image URLs that appear in sequence (recycled); at least 1 image, 6–12 images recommended |
| threshold | `number` | `80` | The threshold (px) of the cursor cumulative displacement to trigger the next picture, the smaller, the denser and more frequent |
| imageWidth | `number` | `190` | Single picture width (px), height is automatically derived according to the aspect ratio of 1.1 |
| followStrength | `number` | `0.5` | Following interpolation coefficient 0–1, the larger it is, the tighter it is, and the smaller it is, the stickier it is |
| fadeDuration | `number` | `0.8` | The duration of a single picture from appearing to fading out (seconds) |
| className | `string` | — | Root container (relative+overflow-hidden capture layer) additional className |
| style | `CSSProperties` | — | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content covered above the trailing layer (such as title copy) |

## Examples
```tsx
<div
  className="relative h-72 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 255)" }}
>
  <ImageTrail images={IMAGES} className="border-0 bg-transparent" />
</div>
```

Sparse large image, slow fade out:
```tsx
<ImageTrail images={IMAGES} threshold={140} imageWidth={240} fadeDuration={1.2} />
```

## Usage Guidelines

- `images` must contain at least one URL; an empty array produces no trail.
- Remote images may be restricted by cross-origin policies. The library showcase uses inline SVG data URIs; prefer local or same-origin assets in production.
- The root container needs to have a clear height + `overflow-hidden`, otherwise the thrown image will overflow the container.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
