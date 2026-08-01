---
slug: coupon
name: Coupon
category: data-display
group: info
tags: []
exports: [Coupon]
status: enriched
---

# Coupon

> Coupon · CSS ticket shape with amount, discount, or shipping kind, four lifecycle states, optional shine, and checkout selection · data-display/info

## When to use

Use Coupon for a complete commerce voucher with value, eligibility, validity, claim, use, or selection actions. Use [[Badge]] or Tag for a simple textual state.

## Import
```ts
import { Coupon } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| kind | `"amount" \| "discount" \| "shipping"` | `"amount"` | Amount-off, percentage discount, or free shipping. |
| amount | `number` | — | Amount value for amount coupons. |
| discount | `number` | — | Discount such as 8.5 for discount coupons. |
| threshold | `number` | — | Minimum spend; zero or omission means no threshold. |
| status | `"available" \| "claimed" \| "used" \| "expired"` | `"available"` | Lifecycle state controlling action and disabled styling. |
| tone | `"brand" \| "danger" \| "neutral"` | `"brand"` | Color tone. |
| size | `"sm" \| "md"` | `"md"` | Size. |
| shine | `boolean` | `false` | Animated claim highlight, automatically off after use or expiry. |
| selected | `boolean` | — | Checkout selection ring. |
| actionLabel | `string` | — | Overrides action text. |
| className | `string` | — | Root class. |

## Events

| Event | Type | Description |
|------|------|------|
| onClaim | `() => void` | Available-state action. |
| onUse | `() => void` | Claimed-state action. |
| onSelect | `() => void` | Independent whole-coupon checkout selection. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Coupon title. |
| scope | `ReactNode` | Applicable scope. |
| validUntil | `ReactNode` | Validity copy. |

## Examples
```tsx
<Coupon kind="amount" amount={50} threshold={299} title="Storewide coupon" scope="All categories" validUntil="Valid through 2026-06-30" onClaim={() => {}} />
<Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="Digital discount" scope="Digital products" onClaim={() => {}} />
<Coupon kind="shipping" tone="neutral" title="Free shipping" scope="Remote regions excluded" onClaim={() => {}} />
```
```tsx
<Coupon kind="amount" amount={30} threshold={199} title="Checkout coupon" status="claimed" selected onSelect={() => {}} />
```

## Usage notes

- Used and expired states disable actions and shine automatically.
- Do not wrap the CSS ticket in overflow-hidden or its punched semicircles are clipped.
- Claim, use, and select map to different states and click regions.
- Built-in action labels are `"\u7acb\u5373\u9886\u53d6"` ("Claim now"), `"\u53bb\u4f7f\u7528"` ("Use now"), `"\u5df2\u4f7f\u7528"` ("Used"), and `"\u5df2\u8fc7\u671f"` ("Expired"). Value and eligibility labels use `"\u6298"` (discount marker), `"\u5305\u90ae"` ("Free shipping"), `"\u65e0\u95e8\u69db"` ("No minimum"), and `` `\u6ee1${threshold}\u53ef\u7528` `` ("Available over the minimum spend").

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
