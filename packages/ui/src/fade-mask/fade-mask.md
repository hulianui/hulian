---
slug: fade-mask
name: FadeMask
category: decoration
group: backdrop
tags: []
exports: [FadeMask]
status: enriched
---

# FadeMask

> 把内容在某一边或从中心向四周淡出到透明 · decoration/backdrop

## 何时用

出血裁切的展示墙底部淡出、点阵 / 网格纹理的中心聚光、横向滚动区两端的淡出。用 CSS mask 实现，不关心下面是什么底色，放在卡片、暗色段落里都对。要模糊渐变用 [ProgressiveBlur](../progressive-blur/progressive-blur.md)；要一片辉光用 [Spotlight](../spotlight/spotlight.md)。

## 导入
```ts
import { FadeMask } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | `"top" \| "bottom" \| "left" \| "right" \| "radial"` | `"bottom"` | 往哪边淡出；`radial` 从 `at` 处向四周渐隐 |
| start | `string` | `"60%"`（径向 `"0%"`） | 线性：从哪里开始淡出（之前全实色）；径向：实色核心占渐变半径的比例 |
| at | `string` | `"50% 50%"` | 径向：渐隐中心 |
| size | `string` | `"50% 50%"` | 径向：渐隐范围（宽 高） |

> 继承 `<div>` 原生属性（定位、尺寸用 `className`）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 被淡出的内容 |

## 示例
```tsx
// 展示墙底部淡出
<FadeMask direction="bottom" start="72%" className="absolute inset-y-0 left-0 w-screen">
  <Card>…</Card>
</FadeMask>

// 点阵纹理中心聚光
<FadeMask direction="radial" at="30% 10%" size="40% 50%" className="absolute inset-0 -z-10">
  <DotPattern />
</FadeMask>
```

## 禁忌 / 坑

- 遮罩作用于整棵子树：里面的可点元素淡出到透明后仍然可点，别把交互控件放进完全透明的那一段。
- 包 DotPattern 等 `absolute inset-0` 的背景层时，FadeMask 自己要有定位与尺寸（如 `absolute inset-0`），否则背景层会对齐到更外层的定位祖先。

## 相关
[Spotlight](../spotlight/spotlight.md) · [DotPattern](../dot-pattern/dot-pattern.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
