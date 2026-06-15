---
slug: scroll-stack
name: ScrollStack
category: data-display
group: collection
tags: [animated]
exports: [ScrollStack, ScrollStackItem]
status: enriched
---

# ScrollStack

> 滚动驱动的卡片堆叠组件 · 逐张钉住 + 缩放递进 + 可选旋转/景深模糊(零依赖原生滚动+RAF·token 皮肤·reduced-motion 静态平铺) · data-display/collection · #animated

## 何时用

做"随页面滚动逐张卡片钉住堆叠、后压前层层递进"的叙事区块（特性介绍、流程步骤）时用。要的是**滚动驱动的纵深堆叠**用本组件；要球面拖拽探索用 [InfiniteMenu](../infinite-menu/infinite-menu.md)，要海报飞行长廊用 [FlyingPosters](../flying-posters/flying-posters.md)。

## 导入
```ts
import { ScrollStack, ScrollStackItem } from "@hulianui/ui"
```

## Props

`ScrollStack`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| itemDistance | `number` | `100` | 相邻卡片初始垂直间距（px），越大未堆叠时铺得越开 |
| itemScale | `number` | `0.03` | 每张相对前一张的缩放增量，形成后压前层层递进的纵深 |
| itemStackDistance | `number` | `30` | 卡片被钉住时彼此错开的垂直距离（px），决定露出的"卡边"高度 |
| stackPosition | `string` | `"20%"` | 触发钉住的位置（容器高度百分比或像素值），卡顶滚到此处开始钉住 |
| scaleEndPosition | `string` | `"10%"` | 缩放结束位置，卡顶越过此处缩放达目标值 |
| baseScale | `number` | `0.85` | 首张（最底层）卡的基础缩放，后续卡按 itemScale 递增 |
| rotationAmount | `number` | `0` | 每层堆叠旋转增量（deg），正值产生扑克牌式扇形错位 |
| blurAmount | `number` | `0` | 被压下方卡片的模糊增量（px），>0 越靠下越模糊；reduced-motion 下自动关闭 |
| className | `string` | — | 追加到滚动容器根节点的类名 |
| style | `CSSProperties` | — | 透传到滚动容器根节点的内联样式 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onStackComplete | `() => void` | 最后一张进入钉住区时触发，可联动后续动效 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 卡片内容，建议每张用 `ScrollStackItem` 包裹（组件自动识别 `data-scroll-stack-card` 标记的元素参与堆叠） |

`ScrollStackItem`：`{ children?: ReactNode; itemClassName?: string }` —— `itemClassName` 追加到单张卡外层。

## 示例
```tsx
// 必须包在一个固定高度 + overflow-hidden 的滚动窗口里，钉住才可见
<div className="h-[28rem] overflow-hidden rounded-xl border border-border">
  <ScrollStack>
    <ScrollStackItem>卡片 1</ScrollStackItem>
    <ScrollStackItem>卡片 2</ScrollStackItem>
    <ScrollStackItem>卡片 3</ScrollStackItem>
  </ScrollStack>
</div>

// 扇形旋转 + 景深模糊
<ScrollStack rotationAmount={3} blurAmount={2}>{/* ... */}</ScrollStack>
```

## 禁忌 / 坑

- **外层必须是定高 + `overflow-hidden` 的滚动窗口**，否则没有滚动行程、卡片不会钉住堆叠。
- 卡片须用 `ScrollStackItem` 包裹（或带 `data-scroll-stack-card`），否则不参与堆叠计算。
- reduced-motion 下退化为静态平铺，`blurAmount` 自动关闭，不要依赖堆叠动画传递关键信息。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
