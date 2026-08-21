---
slug: credit-card
name: CreditCard
category: data-display
group: info
tags: []
exports: [CreditCard, detectBrand, formatCardNumber, maskCardNumber]
status: enriched
---

# CreditCard

> Displays a formatted or masked card number with detected brand and front or back card faces.

## When to use

Use CreditCard in checkout confirmation, wallets, or saved-card management to visualize existing card information. It does not collect payment details; use form controls for card input.

Cardholder labels and the accessible card description follow the nearest `ConfigProvider` locale (`zhCN` by default, or `enUS`).

## Import
```ts
import { CreditCard, detectBrand, formatCardNumber, maskCardNumber } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| number* | `string` | - | Card number with optional spaces; an empty string renders a placeholder card. |
| holder | `string` | - | Cardholder name. |
| expiry | `string` | - | Expiry in MM/YY form. |
| brand | `"visa" \| "mastercard" \| "amex" \| "unionpay" \| "discover" \| "jcb" \| "unknown"` | Auto-detected | Explicit brand override. |
| masked | `boolean` | `true` | Shows only the last four digits. |
| flipped | `boolean` | `false` | Shows the back with magnetic stripe and CVC. |
| cvc | `string` | - | Back-face CVC. |
| className | `string` | - | Custom class name. |

## Examples
```tsx
// Auto-detect the brand and mask by default
<CreditCard number="4111111111111111" holder="ALEX LEE" expiry="12/28" />

// Controlled back face
const [flipped, setFlipped] = useState(false);
<CreditCard number="5500005555555559" holder="JAMIE WU" expiry="08/27" cvc="321" flipped={flipped} />
```

## Pitfalls
`detectBrand`, `formatCardNumber`, and `maskCardNumber` are exported pure helpers. `flipped` is controlled, so the caller owns face state. Chinese runtime labels include `"\u94f6\u8054"` ("UnionPay"), `"\u94f6\u884c\u5361"` ("Bank card" fallback), `"\u5c3e\u53f7"` ("ending in"), `"\u6301\u5361\u4eba"` ("Cardholder"), and `"\u6709\u6548\u671f"` ("Expiry").

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
