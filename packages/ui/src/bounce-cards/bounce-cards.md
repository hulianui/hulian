---
slug: bounce-cards
name: BounceCards
category: data-display
group: collection
tags: [animated]
exports: [BounceCards]
status: enriched
---

# BounceCards

> 扇形弹跳卡 · 一叠卡片扇形铺开的入场弹跳组件 · 逐张 scale 0 弹性弹入 + hover 推挤让位（零依赖去 gsap·motion 弹簧·reduced-motion） · data-display/collection · #animated

## 何时用

需要把一小撮图片/卡片扇形叠放、入场逐张弹入并支持 hover 推挤的展示位时用，多见于营销页 hero 区、相册预览。要自动循环洗牌的 3D 卡堆用 [CardSwap](../card-swap/card-swap.md)；要光标聚光揭示的卡片墙用 [ChromaGrid](../chroma-grid/chroma-grid.md)；要规整的多行数据用 [Table](../table/table.md)。`images` 与 `children` 互斥，传 `children` 时优先用自定义卡片内容。

## 导入
```ts
import { BounceCards } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| images | `string[]` | - | 卡片图片地址数组，按下标对应 `transformStyles`；与 `children` 互斥 |
| containerWidth | `number` | `400` | 容器宽度（px） |
| containerHeight | `number` | `400` | 容器高度（px） |
| animationDelay | `number` | `0.5` | 入场起始延迟（秒），卡片从 scale 0 弹入前的整体等待 |
| animationStagger | `number` | `0.06` | 入场逐张错峰间隔（秒），越大时间差越明显 |
| transformStyles | `string[]` | 五张牌的旋转+横移 | 每张卡片扇形铺开的 transform，按下标对齐；超出数组的卡片回退无变换。例 `'rotate(10deg) translate(-170px)'` |
| enableHover | `boolean` | `true` | 是否开启 hover 推挤（悬停某张时它回正、两侧向外让位） |
| pushDistance | `number` | `160` | hover 时两侧卡片向外让位的横向位移（px） |
| className | `string` | - | 透传根容器类名 |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode[]` | 自定义卡片内容数组，覆盖 `images` 的 `<img>` 渲染；数量决定卡片张数，与 `transformStyles` 按下标对齐 |

## 示例
```tsx
<BounceCards containerWidth={460} containerHeight={240}>
  {[
    <Swatch key="1" label="01" />,
    <Swatch key="2" label="02" />,
    <Swatch key="3" label="03" />,
  ]}
</BounceCards>
```

三张 + 自定义扇形角度、关闭 hover：
```tsx
<BounceCards
  enableHover={false}
  transformStyles={[
    "rotate(8deg) translate(-110px)",
    "rotate(-2deg)",
    "rotate(-8deg) translate(110px)",
  ]}
>
  {cards}
</BounceCards>
```

## 禁忌 / 坑

- `images` 与 `children` 互斥，同时给以 `children` 为准；卡片张数由实际使用的那一组数组长度决定。
- `transformStyles` 按下标对齐卡片，长度不足时多出的卡片无 transform 会全叠在原点，自定义张数时要补齐对应的扇形 transform。
- `animationDelay` / `animationStagger` 单位是**秒**不是毫秒，别误填 500。
- reduced-motion 下跳过弹跳入场直接显示，属预期降级。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
