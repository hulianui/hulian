---
slug: decay-card
name: DecayCard
category: data-display
group: collection
tags: [animated]
exports: [DecayCard]
status: enriched
---

# DecayCard

> Turbulence-decay card · pointer speed drives SVG turbulence and displacement to melt an image, combined with damped parallax movement, RAF easing, and reduced-motion support · data-display/collection · #animated

## When to use

Use DecayCard for a highly expressive single image that appears to melt under a fast pointer pass, such as an artistic cover or hero. Use [TiltedCard](../tilted-card/tilted-card.md) for general 3D tilt, or [PixelCard](../pixel-card/pixel-card.md) for a pixel-wave background.

## Import
```ts
import { DecayCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| width | `number` | `300` | Card width in pixels. |
| height | `number` | `400` | Card height in pixels. |
| image | `string` | `"https://picsum.photos/300/400?grayscale"` | Built-in grayscale placeholder displaced by pointer speed; replace it with a product asset. |
| alt | `string` | `""` | Image alternative; empty treats the image as decorative. |
| baseFrequency | `number` | `0.015` | SVG turbulence frequency. Higher values create finer noise; 0.005 to 0.05 is recommended. |
| numOctaves | `number` | `5` | Turbulence octave count; more creates detail at higher cost. |
| seed | `number` | `4` | Random turbulence seed. |
| maxDisplacement | `number` | `400` | Peak displacement-map scale. |
| movementBound | `number` | `50` | Soft pointer-translation boundary in pixels. |
| className | `string` | — | Class name forwarded to the root. |
| style | `CSSProperties` | — | Inline styles forwarded to the root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Bottom-aligned copy layered above and unaffected by the image filter. |

## Examples
```tsx
<DecayCard image="/cover.jpg" alt="Cover">
  HULIAN
  <br />
  Decay Card
</DecayCard>

<DecayCard image="/cover.jpg" baseFrequency={0.04} numOctaves={6} seed={11}>
  Fine noise
</DecayCard>
```

## Usage notes

- The decay is strongest during fast pointer movement and is minimal on touch. Never use it as the only carrier of information.
- Large `numOctaves` and `maxDisplacement` values make the SVG filter more expensive per frame.
- Replace the placeholder image in production and provide `alt` whenever the image is informative.
- Reduced motion stops the SVG displacement animation and leaves a static image.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
