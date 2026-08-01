---
slug: soft-aurora
name: SoftAurora
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [SoftAurora]
status: enriched
---

# SoftAurora

> Soft aurora · Two phase-offset layers of 3D Perlin noise shape gently moving bands colored by a cosine gradient · Optional pointer parallax, theme-token colors, and a static OGL/WebGL fallback · decoration/backdrop · #animated #webgl

## When to Use

Use SoftAurora when a dark hero or spacious marketing surface needs slow color movement without a sharply defined focal object. It works behind large copy when brightness and band position are restrained. Choose [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md) for regular geometry, or [SideRays](../side-rays/side-rays.md) for directional beams from a corner.

## Import
```ts
import { SoftAurora } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color1 | `string` | `var(--color-chart-1)` | Primary band color for the first layer; accepts any CSS color resolved through an off-screen canvas |
| color2 | `string` | `var(--color-chart-4)` | Secondary color for the offset layer; overlap between the layers creates mixed hues |
| speed | `number` | `0.6` | Animation-speed multiplier; 0.2–2 is recommended |
| scale | `number` | `1.5` | Noise-sampling scale; higher values create finer texture, with 0.8–3 recommended |
| brightness | `number` | `1` | Overall brightness multiplier |
| noiseFrequency | `number` | `2.5` | Base noise frequency, controlling fold density |
| noiseAmplitude | `number` | `1` | Base noise amplitude, controlling vertical variation |
| bandHeight | `number` | `0.5` | Vertical band position from 0 to 1; lower values move the band downward |
| bandSpread | `number` | `1` | Width and intensity of the glow surrounding each band |
| octaveDecay | `number` | `0.1` | Contribution retained by higher-frequency noise octaves |
| layerOffset | `number` | `0` | Time-phase offset between the two layers; nonzero values separate their peaks |
| colorSpeed | `number` | `1` | Horizontal travel speed of the cosine color cycle |
| enableMouseInteraction | `boolean` | `true` | Enable subtle pointer-driven parallax |
| mouseInfluence | `number` | `0.25` | Distance the aurora shifts in response to the pointer |
| className | `string` | — | Class name forwarded to the root |
| style | `CSSProperties` | — | Inline styles forwarded to the root |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Foreground content rendered above the static gradient when reduced motion is enabled |

## Examples
```tsx
// Two-layer aurora using the default chart tokens
<div className="relative h-56 overflow-hidden rounded-xl">
  <SoftAurora className="absolute inset-0" />
</div>

// Slow non-interactive bands with fallback foreground content
<SoftAurora
  speed={0.3}
  bandHeight={0.35}
  enableMouseInteraction={false}
  className="absolute inset-0"
  fallback={<h1 className="...">Hulian component library</h1>}
/>
```

## Usage Guidelines

- SoftAurora does not add `inset-0` itself. Position it explicitly, for example with `absolute inset-0`, inside a `relative` parent that has measurable dimensions and `overflow-hidden`.
- WebGL starts on the client. Reduced motion keeps the root, replaces the canvas with token gradients, and renders `fallback` above that static layer. SSR and WebGL setup failure leave the live root empty.
- `color1` and `color2` are parsed through an off-screen canvas. Use full theme variables such as `var(--color-chart-1)`; bare values such as `var(--primary)` do not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Pointer parallax is decorative and is disabled by fallback paths. Keep essential information in normal foreground content rather than encoding it in motion.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
