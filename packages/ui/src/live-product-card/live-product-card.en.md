---
slug: live-product-card
name: LiveProductCard
category: data-display
group: info
tags: []
exports: [LiveProductCard]
status: enriched
---

# LiveProductCard

> Shows live-commerce products with pricing, stock, sales, active state, and purchase action. · data-display/info

## When to use

Use LiveProductCard for livestream commerce product lists or grids. Use [Card] for a generic container or [PricingTable](../pricing-table/pricing-table.md) for comparison.

## Import
```ts
import { LiveProductCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| image* | `string` | - | Product image. |
| price* | `number` | - | Current price. |
| index | `number` | - | Numbered link badge. |
| originalPrice | `number` | - | Struck original price. |
| explaining | `boolean` | - | Active-explanation pulse. |
| stock | `number` | - | Remaining stock. |
| sold | `number` | - | Sold count. |
| currency | `string` | `"¥"` | Currency symbol. |
| layout | `"row" \| "card"` | `"row"` | Control-panel row or storefront card. |
| className | `string` | - | Root class. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `() => void` | Card activation. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Product title. |
| tag | `ReactNode` | Promotion tag. |
| action | `ReactNode` | Consumer-owned purchase action. |

## Examples
```tsx
<LiveProductCard index={1} image={url} title="Winter fleece jacket" price={129}
  originalPrice={399} explaining tag="Flash sale" stock={86} sold={1240}
  action={<Button tone="danger">Buy now</Button>} />
```

Card layout:
```tsx
<LiveProductCard layout="card" index={3} image={url} title="Wireless earbuds" price={199} originalPrice={499} tag="Limited" sold={920} action={Buy} />
```

## Usage notes

- Action is a slot so the caller owns checkout behavior.
- Original price renders only when supplied; currency applies to both prices.
- Built-in presentation, sold-count, and remaining-stock labels follow `ConfigProvider locale`; `enUS` provides “Presenting”, “Sold N”, and “N left”, while the no-provider fallback remains Chinese.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
