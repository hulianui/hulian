---
slug: qrcode
name: QRCode
category: data-display
group: info
tags: []
exports: [QRCode]
status: enriched
---

# QRCode

> A theme-aware SVG QR code with UTF-8 content, error-correction levels, crisp modules, and an optional center logo.

## When to use

Use QRCode to encode scannable URLs or text in a locally rendered SVG. It supports themed colors, UTF-8 text, and a center logo without a remote image-generation service.

## Import
```ts
import { QRCode } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | — | UTF-8 URL or text to encode. |
| size | `number` | `160` | Side length in pixels. |
| level | `"L" \| "M" \| "Q" \| "H"` | `"M"` | Error-correction level; prefer H with a logo. |
| margin | `number` | `2` | Quiet-zone width in modules. |
| color | `string` | `currentColor` | Dark-module color inherited from text color by default. |
| background | `string` | Transparent | Background color. |
| logo | `QRCodeLogo` | — | Center `{ src: string; size?: number }` logo; pair with `level="H"`. |
| aria-label | `string` | The value | Accessibility label. |
| className | `string` | — | Custom class name. |

## Examples
```tsx
<QRCode value="https://hulian.dev" size={160} level="M" />
```
```tsx
// Inherit the theme's primary text color
<QRCode value="https://hulian.dev" size={140} className="text-primary" />
```

## Pitfalls

- Dark modules default to `currentColor`; set a text class or explicit `color`, and provide sufficient background contrast.
- Use `level="H"` with `logo`, or the covered modules may exceed available correction capacity.
- UTF-8 or long content increases QR density. Increase visual size and scanning distance accordingly.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
