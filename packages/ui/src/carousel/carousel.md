---
slug: carousel
name: Carousel
category: data-display
group: collection
tags: []
exports: [Carousel]
status: enriched
---

# Carousel

> 轮播多张幻灯片，带箭头、圆点、自动播放和拖拽 · data-display/collection

## 何时用

水平翻播一组等宽幻灯片——首页营销 Banner、图集、特性轮播。每个顶层 child 渲染为一张占满视口的卡片。静态多卡片栅格用 [Card](../card/card.md)/[List](../list/list.md) `grid`；本组件专攻"一次只看一张、可翻页/自动播放"的场景，自带 scroll-snap、拖拽、键盘与 reduced-motion 兼容。

## 导入
```ts
import { Carousel } from "@hulianui/ui"
```

## Props

`CarouselProps` 继承原生 div 属性(omit `onSelect`/`children`)：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| current | `number` | - | 受控当前索引(传入即受控) |
| defaultCurrent | `number` | `0` | 非受控初始索引 |
| autoplay | `boolean` | `false` | 自动播放(reduced-motion 下强制关闭) |
| autoplayInterval | `number` | `4000` | 自动播放间隔(毫秒) |
| loop | `boolean` | `false` | 循环：末尾再下一张回到首张 |
| showArrows | `boolean` | `true` | 显示左右切换箭头 |
| showDots | `boolean` | `true` | 显示圆点指示器 |
| aria-label | `string` | `"轮播"` | region 无障碍标签 |
| slideClassName | `string` | - | 每张幻灯片容器的额外类名(如固定高度/圆角) |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(index: number) => void` | 选中变化回调(箭头/圆点/键盘/autoplay/拖拽停靠均触发) |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 幻灯片内容(每个顶层 child 一张) |

## 示例
```tsx
// 营销 Banner（箭头 + 圆点 / 可拖拽 / ←→ 键盘）
<Carousel className="w-96" aria-label="首页促销 Banner">
  {slides.map((s) => <Slide key={s.title} {...s} />)}
</Carousel>

// 自动播放 + 循环
<Carousel autoplay loop>
  {slides.map((s) => <Slide key={s.title} {...s} />)}
</Carousel>
```

## 禁忌 / 坑

- 受控/非受控对称：传 `current` 即受控(须配 `onSelect` 回写)，否则用 `defaultCurrent`。
- `autoplay` 在 `prefers-reduced-motion` 下被强制关闭——无障碍/测试环境别依赖它自动翻页。
- 每张幻灯片占满视口宽度，给幻灯片固定高度走 `slideClassName` 而非内层 div，否则各张高度不一致会抖动。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
