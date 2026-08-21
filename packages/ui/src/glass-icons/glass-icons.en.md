---
slug: glass-icons
name: GlassIcons
category: decoration
group: overlay-fx
tags: [animated]
exports: [GlassIcons]
status: enriched
---

# GlassIcons

> Glass icon grid · Labeled icon buttons with a rotating color plate behind frosted glass · Hover and focus lift the plate, bring the glass forward, and reveal the label · Pure CSS, token colors, RSC-safe, and reduced-motion aware · decoration/overlay-fx · #animated

## When to Use

Use it for a grid of labeled glass-like shortcuts with dimensional hover and focus feedback, such as feature entry points, category navigation, or quick actions. Use [BorderBeam](../border-beam/border-beam.md) or [ShineBorder](../shine-border/shine-border.md) to light one element's border, and [GlareHover](../glare-hover/glare-hover.md) for a reflected sweep. Each GlassIcons item is interactive and needs an accessible name.

## Import
```ts
import { GlassIcons } from "@hulianui/ui"
```

## Props

### GlassIconsProps

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `GlassIconItem[]` | - | A list of icon items, rendered as glass buttons in order according to the grid |
| columns | `number` | `3` | Number of grid columns, narrow screen will automatically fall back to fewer columns |
| className | `string` | - | Forward the root grid container className (can cover the number of columns/spacing/alignment) |
| style | `CSSProperties` | - | Forward the root container inline style |

### GlassIconItem · Props

| Name | Type | Default | Description |
|------|------|------|------|
| label* | `string` | - | hover/focus slides out the text and also acts as a button `aria-label` |
| color | `string` | `"primary"` | Backside glow color, default name `primary\|blue\|purple\|red\|indigo\|orange\|green`, or any CSS color/gradient |
| className | `string` | - | Transmit this button className |

### GlassIconItem · Events

| Event | Type | Description |
|------|------|------|
| onClick | `() => void` | Callback when the icon button is clicked |

### GlassIconItem · Slots

| Slot | Type | Description |
|------|------|------|
| icon* | `ReactNode` | Icon node (usually lucide-react), rendered in the center of the glass front layer, `aria-hidden` |

## Examples

```tsx
import { Heart, Star, Bell } from "lucide-react";

<GlassIcons
  columns={3}
  items={[
{ icon: <Heart />, label: "Collection", color: "red" },
{ icon: <Star />, label: "star", color: "orange" },
{ icon: <Bell />, label: "Notification", color: "blue" },
  ]}
/>

// Custom gradient color
<GlassIcons
  columns={2}
  items={[
{ icon: <Cloud />, label: "Aurora", color: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))" },
  ]}
/>
```

## Usage Guidelines

- `label` is both slide-out text and `aria-label`, required, do not leave blank for visual - otherwise the button will lose its accessibility name.
- Glass luminescence is only clear on dark backgrounds, and the effect is weak on light backgrounds; `color` must be prefixed with `--color-` when feeding tokens/gradients.
- The container needs to be `overflow-visible`, otherwise the 3D lift and label slide out will be cut off.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
