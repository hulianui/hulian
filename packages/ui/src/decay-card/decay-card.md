---
slug: decay-card
name: DecayCard
category: data-display
group: collection
tags: [animated]
exports: [DecayCard]
status: enriched
---

# DecayCard

> 湍流溶解卡 · 鼠标驱动的「湍流溶解」图片卡 · SVG feTurbulence+feDisplacementMap 随鼠标速度融化图像 + 带阻尼的视差倾斜平移（零依赖去 gsap·RAF 缓动·reduced-motion） · data-display/collection · #animated

## 何时用

要一张图片卡随鼠标快速划过"融化/溶解"的高表现力视觉（艺术化封面、hero 单图）时用。本组件聚焦**单张图片的湍流溶解 + 视差平移**；要悬停指针 3D 倾斜的通用卡用 [TiltedCard](../tilted-card/tilted-card.md)，要像素波纹背景卡用 [PixelCard](../pixel-card/pixel-card.md)。

## 导入
```ts
import { DecayCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width | `number` | `300` | 卡片宽度（px） |
| height | `number` | `400` | 卡片高度（px） |
| image | `string` | 灰度占位图 | 卡片主图地址，鼠标快速划过时被湍流位移溶解；生产请替换为业务图 |
| alt | `string` | `""` | 图片 alt 文本（默认空，按纯装饰图） |
| baseFrequency | `number` | `0.015` | feTurbulence 基础频率，越大噪声越密、溶解颗粒越细，建议 0.005-0.05 |
| numOctaves | `number` | `5` | feTurbulence 倍频层数，越多细节越丰富也越耗 |
| seed | `number` | `4` | 湍流随机种子，换数字即换一套溶解纹理 |
| maxDisplacement | `number` | `400` | 位移上限（feDisplacementMap scale 峰值），鼠标越快溶解越剧烈 |
| movementBound | `number` | `50` | 卡片随鼠标平移软边界（px），超出后按 0.2 系数推进形成弹性阻尼手感 |
| className | `string` | - | 透传到根容器的额外 className |
| style | `CSSProperties` | - | 透传到根容器的内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 覆盖在卡底的文字内容，层叠在图片之上、不受溶解影响 |

## 示例
```tsx
<DecayCard image="/cover.jpg" alt="封面">
  瑚琏
  <br />
  溶解卡片
</DecayCard>

// 细颗粒溶解（高频 + 多倍频）
<DecayCard image="/cover.jpg" baseFrequency={0.04} numOctaves={6} seed={11}>
  细噪
</DecayCard>
```

## 禁忌 / 坑

- 溶解只在**鼠标快速划过**时明显（按鼠标速度驱动 displacement），静止/触屏几乎无溶解，不要依赖它表达关键信息。
- `numOctaves` / 大 `maxDisplacement` 越高，SVG 滤镜每帧重算越耗，低端设备易掉帧；按需调低。
- 默认 `image` 是占位灰度图，生产务必替换；`alt` 默认空（装饰图），若图片承载信息须显式传 `alt`。
- SVG `feTurbulence`/`feDisplacementMap` 滤镜，零依赖；reduced-motion 下停溶解动画退化静态图。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
