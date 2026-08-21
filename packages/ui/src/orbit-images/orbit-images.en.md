---
slug: orbit-images
name: OrbitImages
category: decoration
group: overlay-fx
tags: [animated]
exports: [OrbitImages]
status: enriched
---

# OrbitImages

> Shape-based orbit layout · Moves child items around nine preset tracks or a custom path + even distribution or shared start + tilt + center overlay (CSS `offset-path` · zero dependencies · client component · reduced-motion support) · decoration/overlay-fx · #animated

## When to Use

Use it to circulate avatars, icons, or logos along a shaped track in an ecosystem, partner, or technology-stack display. For simple concentric circular orbits, use [OrbitingCircles](../orbiting-circles/orbiting-circles.md). OrbitImages supports richer `offset-path` shapes, arbitrary React nodes, and server rendering without JavaScript dependencies.

## Import
```ts
import { OrbitImages } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| shape | `"ellipse"\|"circle"\|"square"\|"rectangle"\|"triangle"\|"star"\|"heart"\|"infinity"\|"wave"\|"custom"` | `"ellipse"` | Track preset; set `customPath` when using `"custom"` |
| customPath | `string` | - | SVG path d with shape="custom" (coordinates based on baseWidth square canvas) |
| baseWidth | `number` | `1400` | Design canvas side length (px·square viewBox), only affects path geometric proportions |
| radiusX | `number` | `700` | Horizontal radius of ellipse/rectangle/infinity/wave (px·based on baseWidth) |
| radiusY | `number` | `170` | Vertical radius of ellipse/rectangle/infinity/wave |
| radius | `number` | `300` | Radius of circle/square/triangle/star/center |
| starPoints | `number` | `5` | Number of points in the star track |
| starInnerRatio | `number` | `0.5` | Star inner-to-outer radius ratio (0-1); lower values create sharper points |
| rotation | `number` | `-8` | Orbital inclination angle (deg), the child rotates in the opposite direction to maintain uprightness |
| duration | `number` | `40` | The time it takes to complete a lap (seconds), the larger it is, the slower it is |
| itemSize | `number` | `64` | Single child side length (px·CSS pixels) |
| direction | `"normal"\|"reverse"` | `"normal"` | Flow direction |
| fill | `boolean` | `true` | Distributes items evenly when true; starts all items from the same point when false |
| showPath | `boolean` | `false` | Trace track path (debug/decoration) |
| pathColor | `string` | `"var(--color-border)"` | Track stroke color |
| pathWidth | `number` | `2` | Track stroke width (px·based on baseWidth) |
| className | `string` | - | Passthrough to root container |
| style | `CSSProperties` | - | Inline styles forwarded to the root container, which defaults to a 1:1 aspect ratio and fills the parent width |

## Slots

| Slot | Type | Description |
|------|------|------|
| items * | `ReactNode[]` | Sub-items surrounding the track (img/icon/avatar/card are acceptable), required |
| centerContent | `ReactNode` | Centered content (Logo/Title), does not rotate with the track |

## Examples
```tsx
// Elliptical orbit · Equidistant tiles · Trace path · Center title
<OrbitImages
  items={chips}
  shape="ellipse"
  duration={24}
  itemSize={48}
  showPath
  centerContent={<span className="text-sm font-semibold">Hulian</span>}
/>
```
```tsx
// circular orbit
<OrbitImages items={chips} shape="circle" radius={260} duration={30} itemSize={44} />
```

## Usage Guidelines

- Pure CSS `offset-path` driver with zero dependencies; however, `offset-path` has compatibility
  differences in old browsers and some WebKit builds, so verify key scenarios on real devices.
- Client component (`"use client"`): it measures the container in a layout effect to compute the
  scale. Nothing is measured during SSR and nothing errors out; the first frame renders unscaled.
- `radiusX/Y/radius/baseWidth` are all design pixels in the baseWidth coordinate system, not the final screen pixels - the container is scaled by CSS to fill the parent width, adjust the geometric proportion to change these, and adjust the actual size to change the size of the parent container.
- `pathColor` uses semantic colors such as `var(--color-border)` with `--color-` prefix when giving tokens to avoid naked var from not being parsed. See [[hulian-token-color-var-needs-color-prefix]].

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
