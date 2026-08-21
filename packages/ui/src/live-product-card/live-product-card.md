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

> 展示直播带货商品，含价格、库存和抢购入口 · data-display/info

## 何时用

直播带货「小黄车」商品卡：序号链接、现价/划线原价、讲解中脉冲、库存已售、秒杀角标、抢购钮。中控弹层列表用 `layout="row"`，商品橱窗网格用 `layout="card"`。本组件是带货专用皮肤；要通用容器卡片用 [Card]，要价目对比用 [PricingTable](../pricing-table/pricing-table.md)。

## 导入
```ts
import { LiveProductCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| image* | `string` | - | 商品图 URL |
| price* | `number` | - | 现价（秒杀价） |
| index | `number` | - | 第 N 号链接徽标 |
| originalPrice | `number` | - | 划线原价 |
| explaining | `boolean` | - | 「讲解中」脉冲徽标 |
| stock | `number` | - | 剩余库存 |
| sold | `number` | - | 已售数 |
| currency | `string` | `"¥"` | 货币符号 |
| layout | `"row" \| "card"` | `"row"` | 布局：row=列表行（中控/弹层），card=网格卡 |
| className | `string` | - | 自定义类 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `() => void` | 点击回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 商品标题 |
| tag | `ReactNode` | 角标，如「秒杀」「限量」 |
| action | `ReactNode` | 抢购按钮（调用方传 Button 等） |

## 示例
```tsx
<LiveProductCard
  index={1}
  image={url}
  title="冬季加厚羊羔绒外套 直播专享"
  price={129}
  originalPrice={399}
  explaining
  tag="秒杀"
  stock={86}
  sold={1240}
  action={<Button tone="danger">去抢购</Button>}
/>
```

网格卡布局：
```tsx
<LiveProductCard layout="card" index={3} image={url} title="无线蓝牙耳机" price={199} originalPrice={499} tag="限量" sold={920} action={Buy} />
```

## 禁忌 / 坑

- `action` 是插槽，组件不内置按钮——抢购钮由调用方传入（Button 等），便于挂自己的下单逻辑。
- 划线原价仅在 `originalPrice` 存在时渲染；`currency` 同时作用于现价与原价。
- “讲解中”、销量和剩余库存文案跟随 `ConfigProvider locale`；`enUS` 分别提供 “Presenting”、“Sold N” 和 “N left”，未包 Provider 时保持中文。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
