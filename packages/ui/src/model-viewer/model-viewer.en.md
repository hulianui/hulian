---
slug: model-viewer
name: ModelViewer
category: decoration
group: overlay-fx
tags: [animated]
exports: [ModelViewer]
status: enriched
---

# ModelViewer

> Interactive CSS 3D stage · Inertial drag rotation + pointer parallax + hover tilt + auto-rotation + contact shadow (zero dependencies · rAF · reduced-motion support) · decoration/overlay-fx · #animated

## When to Use

Use it to place any React node—a product image, card, SVG, or emoji—on a 3D stage with inertial drag rotation, parallax, hover tilt, and a contact shadow. It uses CSS 3D instead of three.js and does not load GLTF or FBX assets. For magnification, use [Lens](../lens/lens.md); for a glare-only hover effect, use [GlareHover](../glare-hover/glare-hover.md).

## Import
```ts
import { ModelViewer } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| width | `number \| string` | `"100%"` | Stage width, constrained by outer container |
| height | `number \| string` | `360` | Stage height |
| defaultRotationY | `number` | `-20` | Initial yaw angle (around Y, °), accumulated when dragging |
| defaultRotationX | `number` | `12` | Initial pitch angle (around X, °), accumulated when dragging |
| perspective | `number` | `1000` | CSS perspective depth in pixels; lower values create more exaggerated perspective |
| enableManualRotation | `boolean` | `true` | Allow the mouse to drag and rotate, and let go to slow down with inertia |
| enableMouseParallax | `boolean` | `true` | Mouse parallax (the model is slightly displaced when the pointer moves) |
| enableHoverRotation | `boolean` | `true` | Hover tilt (the model tilts towards the pointer) |
| autoRotate | `boolean` | `false` | Automatically rotate around the Y-axis at a constant speed, superimposed with manual dragging |
| autoRotateSpeed | `number` | `24` | Rotation angular speed (°/s), only valid for `autoRotate` |
| showResetButton | `boolean` | `true` | Shows the "Reset Perspective" button in the upper-right corner |
| showContactShadow | `boolean` | `true` | Shows a soft contact shadow beneath the content |
| className | `string` | — | Additional class name for the root container |
| style | `CSSProperties` | — | Inline styles forwarded to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Place the "model" in the center of the 3D stage, and apply rotation/parallax/tilt uniformly through the components |

## Examples

```tsx
//Default: drag rotation + parallax + hover tilt + contact shadow
<ModelViewer>
  <YourModel />
</ModelViewer>

// Automatic rotating booth
<ModelViewer autoRotate autoRotateSpeed={24} showContactShadow>
  <ProductCard />
</ModelViewer>
```

## Usage Guidelines

- This is a CSS 3D stage, no real GLTF/FBX/OBJ is rendered; `children` should be flat/pseudo 3D content, the sense of depth comes from the outer `preserve-3d` sublayer itself using `translateZ`.
- This is a client component because dragging and inertia use rAF. Under reduced motion, inertia and rotation are suppressed.
- Contents that require `transform-style: preserve-3d` for multi-layer cubes must be set in children by yourself, and the component is only responsible for the overall rotation/parallax container.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
