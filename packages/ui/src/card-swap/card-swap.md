---
slug: card-swap
name: CardSwap
category: data-display
group: collection
tags: [animated]
exports: [CardSwap]
status: enriched
---

# CardSwap

> 3D 透视卡片自动洗牌组件 · 最前卡下坠 → 其余递进 → 绕回队尾循环 + 复合 CardSwap.Card 默认皮肤（去 gsap·motion useAnimate·reduced-motion） · data-display/collection · #animated

## 何时用

需要一摞 3D 透视卡片自动循环轮播（最前卡下坠、其余递进、回到队尾）的展示位时用，多见于营销页贴边构图（`placement="bottom-right"`）或画廊居中展示（`placement="center"`）。要扇形铺开+入场弹跳的静态叠卡用 [BounceCards](../bounce-cards/bounce-cards.md)；要光标聚光揭示的卡片墙用 [ChromaGrid](../chroma-grid/chroma-grid.md)。子项用 `<CardSwap.Card>` 自带默认皮肤，也可塞任意元素；至少 2 张才轮换。

## 导入
```ts
import { CardSwap } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width | `number` | `380` | 单张卡片宽度（px），整体以右下角为锚点 |
| height | `number` | `280` | 单张卡片高度（px） |
| cardDistance | `number` | `56` | 相邻卡片水平+纵深（X/Z）错位距离（px），越大越散 |
| verticalDistance | `number` | `64` | 相邻卡片垂直（Y）错位距离（px），台阶高度 |
| delay | `number` | `5000` | 自动轮换间隔（ms） |
| pauseOnHover | `boolean` | `false` | 鼠标悬停是否暂停轮换 |
| skewAmount | `number` | `5` | 卡片倾斜角（deg, skewY）制造纵深；`0` 即正视 |
| easing | `"elastic" \| "smooth"` | `"elastic"` | 缓动风格；`smooth` 顺滑无回弹更克制 |
| placement | `"bottom-right" \| "center"` | `"bottom-right"` | 堆叠定位；`bottom-right` 右下锚定外溢（贴边营销），`center` 整摞居中完整可见（画廊/普通容器） |
| className | `string` | — | 透传根容器类名 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCardClick | `(index: number) => void` | 点击某卡回调，参数为该卡在 children 中的原始索引 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 堆叠卡片内容，建议用 `<CardSwap.Card>`；至少 2 张才轮换 |

## 示例
```tsx
<div className="relative h-96 overflow-hidden rounded-xl">
  <CardSwap width={300} height={200} delay={3000} placement="center" pauseOnHover>
    <CardSwap.Card>
      <p className="text-sm font-semibold">实时同步</p>
      <p className="mt-2 text-xs">毫秒级状态推送，跨端一致。</p>
    </CardSwap.Card>
    <CardSwap.Card>...</CardSwap.Card>
    <CardSwap.Card>...</CardSwap.Card>
  </CardSwap>
</div>
```

顺滑缓动 + 企业克制节奏：
```tsx
<CardSwap easing="smooth" skewAmount={4} placement="center" delay={2600}>
  {cards}
</CardSwap>
```

## 禁忌 / 坑

- 默认 `placement="bottom-right"` 会向外溢出 5%/18% 贴边，普通/画廊容器里整摞看不全，请改 `placement="center"`（showcase 全用 center）。
- 至少 2 张子卡片才会轮换，单张静止。
- `delay` 单位是毫秒；根容器需要 `relative + overflow-hidden` 承托透视堆叠。
- reduced-motion 下停止自动轮换，属预期降级。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
