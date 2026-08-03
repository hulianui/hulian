---
slug: tilt
name: Tilt
category: decoration
group: overlay-fx
tags: ["animated"]
exports: [Tilt, tiltAngles, glareState, normalizePointer]
status: enriched
---

# Tilt

> Parallax tilt wrapper · Applies 3D tilt to arbitrary children instead of imposing a card structure · Pointer, gyroscope, and manual-angle input · Window tracking, single-axis restriction, reversal, resting angles, and hover scaling · Pointer-following glare calculated from geometry · onTiltMove reports angles and glare on every frame for layered parallax · Pure geometry helpers, Hulian motion tokens, zero dependencies, and reduced-motion support · decoration/overlay-fx

## When to use

Use Tilt to give any content a subtle pointer-driven sense of depth, such as a pricing card, chart card, sign-in panel, hero artwork, or 3D headline.

[TiltedCard](../tilted-card/tilted-card.md) is a ready-made card with an image, floating caption, and overlay. Tilt is the lower-level primitive: it supplies only tilt and glare, so it can wrap any layout. Choose TiltedCard for a conventional image card and Tilt for custom content.

Its capability set parallels `react-parallax-tilt`, including glare, gyroscope input, window tracking, manual angles, axis restriction, resting angles, and callbacks, while remaining dependency-free, using Hulian's motion source of truth, and respecting `prefers-reduced-motion` by default.

## Import
```ts
import { Tilt } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tiltEnable | `boolean` | `true` | Master enable switch. |
| maxAngleX / maxAngleY | `number` | `12` | Maximum rotation around each axis, in degrees. |
| reverse | `boolean` | `false` | Reverses the tilt direction. |
| axis | `"x" \| "y"` | — | Restricts tilt to one axis. |
| initialAngleX / initialAngleY | `number` | `0` | Resting angles used while the component is not being driven. |
| manualAngleX / manualAngleY | `number \| null` | — | Manually controls an axis from a slider, joystick, or scroll position. `null` or omission leaves that axis under pointer control. |
| scale | `number` | `1` | Hover scale multiplier. |
| perspective | `number` | `1000` | Perspective distance in pixels. Smaller values produce a stronger effect. |
| transitionSpeed | `number` | `300` | Transition duration in milliseconds. |
| transitionEasing | `string` | Hulian `ease-out` | Transition timing function. |
| reset | `boolean` | `true` | Returns to the resting angles on pointer leave. |
| trackOnWindow | `boolean` | `false` | Tracks the pointer across the whole window, suitable for a large hero. |
| gyroscope | `boolean` | `false` | Listens to device orientation. The host site must request permission on iOS. |
| glare | `boolean` | `false` | Enables the reflective highlight layer. |
| glareMaxOpacity | `number` | `0.35` | Maximum glare opacity. |
| glareColor | `string` | `"#ffffff"` | Glare color. |
| glareReverse | `boolean` | `false` | Reverses the glare direction. |
| glareBorderRadius | `string` | — | Border radius for the glare layer. Match the wrapped content. |
| onTiltMove / onTiltEnter / onTiltLeave | callbacks | — | Reports per-frame angles and glare, pointer entry, and pointer leave. |

### Exported pure functions

`tiltAngles(px, py, opts)` maps a normalized pointer to rotation angles. `glareState(px, py, opts)` returns the glare angle and intensity. `normalizePointer(clientX, clientY, rect)` maps a client coordinate into the 0..1 range. Reuse these helpers when another layer needs to follow the same parallax geometry.

## Example
```tsx
// Add tilt and glare to any card.
<Tilt glare glareBorderRadius="calc(var(--radius) + 0.25rem)" maxAngleX={16} maxAngleY={16}>
  <PricingCard {...plan} />
</Tilt>

// Drive an axis from a slider or scroll progress.
<Tilt manualAngleX={angle} manualAngleY={0} />

// Drive a second layer from the live angles.
<Tilt onTiltMove={({ angles }) => setDepth(angles)}>...</Tilt>
```

## Usage guidelines

- **Match `glareBorderRadius` to the wrapped element's radius.** Otherwise the highlight remains a square and leaks across rounded corners.
- **Device orientation requires the host site to obtain `DeviceOrientationEvent` permission on iOS**, inside a user gesture through `requestPermission()`. Without permission, no event fires and Tilt remains at its resting angle without throwing.
- `trackOnWindow` keeps a card moving even when the pointer is not hovering it. Multiple window-tracked cards compete for attention, so normally reserve it for one hero element.
- **Reduced motion disables tilt completely** because this effect can trigger vestibular discomfort. Children still render normally.
- Tilt uses CSS 3D and `transform-style: preserve-3d`. If the wrapped content also combines `overflow: hidden` with a large radius, some browsers can show jagged edges. Put the radius on the wrapped element and let Tilt handle only the transform.

## Related
[TiltedCard](../tilted-card/tilted-card.md) · [MagicCard](../magic-card/magic-card.md) · [GlareHover](../glare-hover/glare-hover.md) · [CardSpotlight](../card-spotlight/card-spotlight.md) · [ProfileCard](../profile-card/profile-card.md) · [Reveal](../reveal/reveal.md)
