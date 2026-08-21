---
slug: galaxy
name: Galaxy
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Galaxy]
status: enriched
---

# Galaxy

> Parallax galaxy · Four procedural star layers combine hash-distributed points, cross glows, HSV color shifts, triangular-wave twinkle, rotation, and pointer repulsion · OGL/WebGL, lazy loading, StrictMode-safe cleanup, and a radial-gradient fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for a deep-space backdrop behind a hero, launch screen, or large dashboard. Use [Ferrofluid](../ferrofluid/ferrofluid.md) for liquid metal, [DotPattern](../dot-pattern/dot-pattern.md) for a static dot matrix, or [Spotlight](../spotlight/spotlight.md) for a single pointer focus. Galaxy emphasizes layered parallax, twinkling stars, and pointer repulsion.

## Import
```ts
import { Galaxy } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| focal | `[number, number]` | `[0.5, 0.5]` | Normalized convergence point and center of the galaxy's spread |
| rotation | `[number, number]` | `[1, 0]` | View rotation as a cosine/sine vector; `[0.707, 0.707]` is approximately 45 degrees |
| starSpeed | `number` | `0.5` | Star-drift speed multiplier |
| density | `number` | `1` | Star density; 0.5 is sparse and 2 is dense |
| hueShift | `number` | `140` | Hue offset from 0 to 360; the default produces cyan highlights |
| speed | `number` | `1` | Overall drift and twinkle speed multiplier |
| mouseInteraction | `boolean` | `true` | Enables galaxy offset or repulsion on pointer movement |
| glowIntensity | `number` | `0.3` | Star-glow intensity |
| saturation | `number` | `0` | Color saturation; 0 keeps stars nearly white, while higher values reveal `hueShift` |
| mouseRepulsion | `boolean` | `true` | Pushes stars away when true or translates the whole field when false; requires `mouseInteraction` |
| repulsionStrength | `number` | `2` | Pointer repulsion strength, only effective when `mouseRepulsion=true` |
| twinkleIntensity | `number` | `0.3` | Star point flashing intensity, 0=no flashing |
| rotationSpeed | `number` | `0.1` | Galaxy automatic rotation speed, 0 = no rotation |
| autoCenterRepulsion | `number` | `0` | Automatic repulsion from the center; values above 0 open a central cavity surrounded by stars |
| transparent | `boolean` | `true` | Preserve alpha so the container background shows through; false renders a solid black deep-space background |
| className | `string` | - | Root container (or div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static non-WebGL content for SSR, reduced motion, or unavailable WebGL; defaults to a radial gradient |

## Examples
```tsx
// Default blue galaxy with pointer repulsion
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <Galaxy />
</div>
```
```tsx
// Center star ring + warm purple tone
<Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false} />
```

## Usage Guidelines

- OGL/WebGL renders on the client with lazy loading and StrictMode-safe cleanup. SSR and unavailable WebGL show the radial-gradient fallback.
- Place the root in a `relative overflow-hidden` container with an explicit height such as `h-64`.
- With `transparent={true}`, add a dark container background for a deep-space look. Use `transparent={false}` for a built-in solid black background.
- `mouseRepulsion` and `repulsionStrength` take effect only when `mouseInteraction=true`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
