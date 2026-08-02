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

> 优惠券 · 撕票造型(中缝虚线+上下半圆穿孔·纯CSS) + 满减/折扣/包邮三类 + 可领/已领/已用/过期四态 + 选券高亮(电商标配·只消费 token) · data-display/info

## 何时用

电商/营销场景展示一张优惠券（满减/折扣/包邮），含领取、去用、结算选券等动作。需要纯文本状态徽记用 [[Badge]] 或 Tag，本组件是带面额区与操作区的完整票据卡片。

## 导入
```ts
import { Coupon } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| kind | `"amount" \| "discount" \| "shipping"` | `"amount"` | 券类型：满减额 / 折扣 / 包邮，决定左侧面额区主视觉。 |
| amount | `number` | — | 面额（满减额，单位元）。kind=amount 时显示 ¥{amount}。 |
| discount | `number` | — | 折扣（如 8.5 显示 8.5 折）。kind=discount 时使用。 |
| threshold | `number` | — | 使用门槛（满 X 元可用）。0 / 省略 = 无门槛。 |
| status | `"available" \| "claimed" \| "used" \| "expired"` | `"available"` | 券状态，驱动操作区文案与置灰。 |
| tone | `"brand" \| "danger" \| "neutral"` | `"brand"` | 配色。 |
| size | `"sm" \| "md"` | `"md"` | 尺寸。 |
| shine | `boolean` | `false` | 面额区周期性扫光引导领取；建议仅对 available 券开启，已用/过期券自动不播。 |
| selected | `boolean` | — | 选中态（结算页选券高亮 ring）。 |
| actionLabel | `string` | — | 覆盖操作区按钮文案。 |
| className | `string` | — | — |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClaim | `() => void` | 领取回调（status=available 时操作按钮触发）。 |
| onUse | `() => void` | 使用 / 去凑单回调（status=claimed 时操作按钮触发）。 |
| onSelect | `() => void` | 整券可点（结算选券），点击触发；与右侧按钮独立。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 券标题（如「全场通用券」）。 |
| scope | `ReactNode` | 适用范围 / 副说明（如「仅限数码品类」）。 |
| validUntil | `ReactNode` | 有效期文案（如「2026.06.30 前有效」）。 |

## 示例
```tsx
// 三类券
<Coupon kind="amount" amount={50} threshold={299} title="全场通用满减券" scope="支持全部品类" validUntil="2026.06.30 前有效" onClaim={() => {}} />
<Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="数码专享折扣券" scope="仅限数码 3C" onClaim={() => {}} />
<Coupon kind="shipping" tone="neutral" title="全国包邮券" scope="偏远地区除外" onClaim={() => {}} />
```
```tsx
// 结算选券（受控高亮）
<Coupon kind="amount" amount={30} threshold={199} title="结算选券" status="claimed" selected onSelect={() => {}} />
```

## 禁忌 / 坑

- `status="used" | "expired"` 时操作区自动置灰、`shine` 扫光不播；不必额外手动禁用。
- 撕票穿孔/中缝是纯 CSS 伪元素绘制，外层不要再裹会裁剪溢出的 `overflow-hidden` 容器，否则半圆穿孔被切。
- `onClaim`/`onUse`/`onSelect` 三类回调对应不同 status 与点击区，互相独立——结算选券走 `onSelect`（整券），领取走 `onClaim`（右侧按钮）。
- 操作文案、完整折扣值和使用门槛跟随 `ConfigProvider locale`；例如 `discount={8.5}` 默认显示 `8.5折`，`enUS` 显示 `15% off`。显式 `actionLabel` 优先；旧字典没有 `formatDiscount` 时安全回退中文完整值。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
