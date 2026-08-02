---
slug: wavy-background
name: WavyBackground
category: decoration
group: backdrop
tags: [animated]
exports: [WavyBackground, valueNoise2D]
status: enriched
---

# WavyBackground

> Noise waves · Canvas color-band background + dependency-free value noise + chart tokens + reduced-motion static frame · decoration/backdrop · #animated

## When to Use

Use it for soft, flowing color bands behind a hero or marketing section. Its dependency-free Canvas noise looks more liquid than the pure CSS [Aurora](../aurora/aurora.md), at the cost of Canvas rendering. Use [GridPattern](../grid-pattern/grid-pattern.md) or [DotPattern](../dot-pattern/dot-pattern.md) for regular geometry. The exported `valueNoise2D` helper can drive custom waveforms.

## Import
```ts
import { WavyBackground, valueNoise2D } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | string[] | Chart tokens | Wave colors; accepts any CSS color string, including `var(--…)`, and resolves computed values after mount |
| waveWidth | number | 50 | Wave stroke width in pixels; higher values produce thicker bands |
| backgroundFill | string | `--color-background` / `--color-bg` | Background fill color, translucent drawing of each frame produces smear |
| blur | number | 10 | canvas filter blur (px), 0=no blur |
| speed | `"slow" \| "fast"` | `"fast"` | Animation speed |
| waveOpacity | number | 0.5 | Overall transparency of each wave (0–1) |
| className | string | — | Content container class (wrapper div overlaid on the wave) |
| containerClassName | string | — | Outer root container class |
| containerProps | `Omit<HTMLAttributes<HTMLDivElement>, "className"> & Record<\`data-${string}\`, …>` | — | Attributes forwarded to the outer root div, including custom `data-*` attributes |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | ReactNode | Content above the wave (absolute centered overlay) |

## Examples
```tsx
// Default fast + chart token, covering the parent container
<div className="relative h-48 overflow-hidden rounded-xl border">
  <WavyBackground containerClassName="h-full w-full">
    <span className="text-sm font-medium text-foreground">WavyBackground</span>
  </WavyBackground>
</div>
```
```tsx
// Custom brand ribbon + slow speed + light blur
<WavyBackground
  colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8"]}
  speed="slow"
  blur={8}
  containerClassName="h-full w-full"
/>
```

## Usage Guidelines

- Based on canvas, client rendering is required; it will automatically drop to a still frame under `prefers-reduced-motion`. Remember to turn off the system switch when verifying the animation.
- The container size is expanded with `containerClassName` (such as `h-full w-full`), and the outer parent needs to be `relative` + `overflow-hidden`.
- `colors`/`backgroundFill` supports `var(--…)`, parsed after mounting - the first frame of SSR will not have color, which is normal.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
