---
slug: liquid-chrome
name: LiquidChrome
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LiquidChrome]
status: enriched
---

# LiquidChrome

> Liquid chrome background · WebGL/ogl metal flow reflection + mouse ripple + chart token base color + static metal gradient fallback · decoration/backdrop · #animated #webgl

## When to Use

Use when you need an area-wide, slow-flowing liquid metal/chrome reflective background (hero, landing page, card base). It `absolute inset-0` covers the parent container and is the background layer rather than the focus element. If you want a luminous energy ball that focuses the line of sight and interacts with the pointer, use [Orb](../orb/orb.md); if you want a static, zero-cost geometric pattern, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md) / [StripedPattern](../striped-pattern/striped-pattern.md).

## Import
```ts
import { LiquidChrome } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| baseColor | `[number, number, number] \| string` | `var(--color-chart-2)` | Liquid chrome base color. `[r,g,b]` is a floating point array of 0..1 (compatible with the original version of react-bits), or any CSS color string; the default reading is chart-2 token following the light and dark theme |
| speed | `number` | `0.2` | Flow-speed multiplier; higher values move faster |
| amplitude | `number` | `0.6` | Waveform amplitude (0 calm → 1 intense), controls the liquid surface distortion amplitude |
| frequencyX | `number` | `2.5` | X-direction spatial frequency |
| frequencyY | `number` | `1.5` | Y direction spatial frequency |
| interactive | `boolean` | `true` | Whether to respond to mouse/touch to push liquid surface ripples |
| className | `string` | - | ClassName passed through to canvas (normal) or fallback div (fallback) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static content overlaid on a metallic gradient background without WebGL |

## Examples

```tsx
// Background layer: the parent must be relative; LiquidChrome fills it with absolute inset-0.
<div className="relative h-48 w-full overflow-hidden rounded-xl">
  <LiquidChrome />
</div>
```

```tsx
// Make the hero background layer, with the content stacked on top
<div className="relative h-72 w-full overflow-hidden rounded-xl">
  <LiquidChrome speed={0.18} amplitude={0.55} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
    <p className="text-2xl font-bold text-white drop-shadow-md">Liquid Chrome</p>
  </div>
</div>
```

## Usage Guidelines

- WebGL renders only on the client. Under SSR, without WebGL, or with reduced motion, the component uses a static metallic-gradient fallback, so account for the initial visual difference.
- Cleanup, do not use `loseContext` to poison the canvas, otherwise the StrictMode double mount reused canvas will collapse into blank - see [[webgl-canvas-loseContext-poisons-strictmode-remount]], a new canvas will be created each time it is mounted.
- `absolute inset-0` for itself, the parent container must be `position:relative` and have a certain height, otherwise it will not be visible; remember to add `relative z-10` for the content overlay.
- Pass the `baseColor` string through CSS color parsing. `var(--primary)` may not be parsed. The token needs to be prefixed with `--color-` - see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
