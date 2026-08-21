---
slug: qrcode
name: QRCode
category: data-display
group: info
tags: []
exports: [QRCode, buildQRCode, qrCodeSvgString, qrCodeToPngDataUrl]
status: enriched
---

# QRCode

> Theme-aware SVG QR codes with UTF-8 content, error-correction boosting, minimum-version control, configurable logo excavation, and matching SVG/PNG/matrix export helpers.

## When to use

Use QRCode to encode scannable URLs or text in a locally rendered SVG. It supports themed colors, UTF-8 text, and a center logo without a remote image-generation service.

## Import
```ts
import { QRCode, buildQRCode, qrCodeSvgString, qrCodeToPngDataUrl } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | - | UTF-8 URL or text to encode. |
| size | `number` | `160` | Side length in pixels. |
| level | `"L" \| "M" \| "Q" \| "H"` | `"M"` | Error-correction level; prefer H with a logo. |
| margin | `number` | `2` | Quiet-zone width in modules. |
| color | `string` | `currentColor` | Dark-module color inherited from text color by default. |
| background | `string` | Transparent | Background color. |
| logo | `QRCodeLogo` | - | Center `{ src: string; size?: number }` logo; pair with `level="H"`. |
| aria-label | `string` | The value | Accessibility label. |
| className | `string` | - | Custom class name. |

### Additional capabilities

| Name | Type | Default | Description |
|------|------|------|------|
| minVersion | `number` | - | Minimum QR version from 1 to 40. Longer content can still increase the version rather than being truncated; setting a floor keeps a group of codes visually consistent in density. |
| boostLevel | `boolean` | `true` | Raises the error-correction level when spare capacity allows, without increasing the QR version. |
| logo.excavate | `boolean` | `true` | Places a background patch under the logo to clear covered modules. Set to `false` for a translucent watermark-style logo. |
| logo.opacity | `number` | `1` | Logo opacity, commonly combined with `excavate={false}` for a watermark. |

The export helpers use the same encoding core as the component, so their output stays consistent:

- `qrCodeSvgString({ value, size, color, background, ... })` returns a standalone SVG string for downloads, email, print artwork, or server-side use. Exported files need concrete colors such as `#000` and `#fff`; `currentColor` has nothing to inherit outside a page.
- `qrCodeToPngDataUrl({ value, pixelSize, ... })` returns a browser-side `Promise<string>` containing a PNG data URL. It scales for `devicePixelRatio` so print and high-density displays remain crisp and uses a white background by default.
- `buildQRCode(options)` returns the pure matrix data `{ count, total, path, level, version }` for custom canvas, poster-composition, or nonstandard rendering.

## Examples
```tsx
<QRCode value="https://hulian.dev" size={160} level="M" />
```
```tsx
// Inherit the theme's primary text color
<QRCode value="https://hulian.dev" size={140} className="text-primary" />
```

## Pitfalls

- **Do not export a PNG with a transparent background.** An exported bitmap cannot inherit the page background, and a transparent code may become unreadable when printed or placed on a white document. `qrCodeToPngDataUrl` defaults to white for this reason.
- **A logo without excavation must be translucent.** An opaque logo with `excavate={false}` covers modules directly and may make the code unscannable; pair watermark mode with `opacity`.
- Unlike qrcode.react's fixed black foreground and white background defaults, QRCode uses `currentColor` and a transparent background so it follows the theme. `qrCodeToPngDataUrl` provides export support without adding a second Canvas component and dependency surface.
- Dark modules default to `currentColor`; set a text class or explicit `color`, and provide sufficient background contrast.
- Use `level="H"` with `logo`, or the covered modules may exceed available correction capacity.
- UTF-8 or long content increases QR density. Increase visual size and scanning distance accordingly.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
