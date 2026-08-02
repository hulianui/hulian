---
slug: liquid-ether
name: LiquidEther
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LiquidEther]
status: enriched
---

# LiquidEther

> Liquid color field · Domain-warped metaballs form a flowing palette that a real or automatic pointer force can stir · Theme-token OGL/WebGL backdrop with configurable opacity and a static fallback · decoration/backdrop · #animated #webgl

## When to Use

Use LiquidEther behind a creative landing page, product hero, or sign-in surface when color should move organically and react to the pointer. Its visual weight is high; lower `opacity` beneath text and reserve full opacity for artwork-led layouts. Choose [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md) for regular geometry, or [Spotlight](../spotlight/spotlight.md) for a localized pointer glow.

## Import
```ts
import { LiquidEther } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-4)"]` | Palette of CSS colors. One value is repeated across the three shader stops; two values reuse the second for the final stop. Theme variables update with light and dark modes. |
| speed | `number` | `0.5` | Animation-speed multiplier; 0.2–1.5 is recommended |
| scale | `number` | `1` | Liquid-blob scale; lower values create smaller separated forms and higher values merge them, with 0.6–2 recommended |
| mouseForce | `number` | `1` | Strength of the real or automatic pointer force; 0 removes pointer-driven force while time-based metaball motion continues, with 0–2 recommended |
| autoDemo | `boolean` | `true` | Drive the force point along a virtual path until a real pointer enters; false leaves the force at rest until real input arrives |
| opacity | `number` | `1` | Root opacity from 0 to 1; 0.6–0.85 often works behind foreground content |
| className | `string` | — | Class name forwarded to the canvas wrapper or fallback root |
| style | `CSSProperties` | — | Inline styles forwarded to the root |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Decorative content rendered inside the static multipoint chart-token gradient when reduced motion is enabled; the fallback root is `aria-hidden` |

## Examples

```tsx
// Automatic force path inside a positioned, clipped parent
<div className="relative h-64 overflow-hidden rounded-xl">
  <LiquidEther />
</div>
```

```tsx
// Slow translucent field with non-interactive foreground copy
<div className="relative h-64 overflow-hidden rounded-xl">
  <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
  <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-white">
    Hulian component library
  </div>
</div>
```

## Usage Guidelines

- The live root is `absolute inset-0 z-0` and receives pointer events. Put it in a `relative overflow-hidden` parent, layer content at `relative z-10`, and use `pointer-events-none` only on decorative foreground copy so movement can still reach LiquidEther. See [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- During SSR, the live root has no canvas. After hydration, a canvas is appended before OGL import and scene setup; if either step fails, that uninitialized or blank canvas remains and LiquidEther does not switch to the reduced-motion fallback. Reduced motion instead renders the static gradient plus decorative `fallback` content.
- CSS variables in `colors` are resolved through an off-screen canvas. Use full names such as `var(--color-chart-1)`; bare values such as `var(--primary)` cannot be resolved. See [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- A throttled animation frame loop can make headless screenshots appear static or empty. Verify motion on a real device or through Playwright frame measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
