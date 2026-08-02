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

> 银行卡展示 · 卡号前缀识别品牌(visa/mastercard/amex/银联/jcb/discover) + 分组格式化/打码(纯函数可测) + token 渐变卡面 + 芯片/品牌字标 + 正反面(磁条/CVC) · 结算确认/钱包(纯展示·RSC) · data-display/info

## 何时用

在结算确认、钱包、绑卡管理处展示一张银行卡卡面（品牌识别 + 卡号打码 + 正反面）。纯展示组件，不做表单录入；要采集卡号请用表单输入控件，本组件只负责把已有卡信息可视化成一张卡。

持卡人、有效期与无障碍卡片说明跟随最近的 `ConfigProvider` locale；默认 `zhCN`，切换 `enUS` 后使用英文。

## 导入
```ts
import { CreditCard, detectBrand, formatCardNumber, maskCardNumber } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| number* | `string` | — | 卡号，可含空格，内部归一；空串渲染占位卡 |
| holder | `string` | — | 持卡人姓名 |
| expiry | `string` | — | 有效期 MM/YY |
| brand | `"visa" \| "mastercard" \| "amex" \| "unionpay" \| "discover" \| "jcb" \| "unknown"` | 自动识别 | 强制品牌；省略则由卡号前缀自动识别 |
| masked | `boolean` | `true` | 仅显示后 4 位，其余打码 |
| flipped | `boolean` | `false` | 翻到背面（磁条 + CVC） |
| cvc | `string` | — | 背面 CVC |
| className | `string` | — | 透传类名 |

## 示例
```tsx
// 品牌按卡号前缀自动识别 + 默认打码
<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />

// 受控翻面查看背面 CVC
const [flipped, setFlipped] = useState(false);
<CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped={flipped} />
```

## 禁忌 / 坑
暂无已知坑。`detectBrand` / `formatCardNumber` / `maskCardNumber` 是导出的纯函数，可在卡面外独立复用与单测。`flipped` 是受控 prop，需自行管理翻面状态。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
