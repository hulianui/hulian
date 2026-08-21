---
slug: chip
name: Chip
category: data-display
group: info
tags: []
exports: [Chip, chipVariants]
status: enriched
---

# Chip

> 紧凑的标记令牌，可带圆点也可移除 · data-display/info

## 何时用

展示一个分类/筛选/选中标签，常带可移除（×）、前导点、头像或图标。它表达「一个带文字的标签实体且可被移除」；要叠加到宿主四角的未读计数/红点用 [Badge](../badge/badge.md)；只要一个纯状态圆点用 [Dot](../dot/dot.md)。

## 导入
```ts
import { Chip, chipVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"solid"｜"soft"｜"outline"` | `soft` | 视觉风格。 |
| tone | `"brand"｜"danger"｜"neutral"` | `brand` | 语气色。 |
| size | `"sm"｜"md"` | `md` | 尺寸。 |
| dot | `boolean` | - | 前导小圆点（状态指示）。 |
| isDisabled | `boolean` | - | 禁用：降透明度、屏蔽指针事件、关闭按钮不可点。 |
| className | `string` | - | - |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClose | `() => void` | 提供则渲染关闭(×)按钮并触发回调（区别于 Badge：Chip 可移除）。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| avatar | `ReactNode` | 前导头像（贴左边缘，按 size 约束为正方形）。 |
| startContent | `ReactNode` | 起始内容槽（图标等），avatar 存在时不渲染。 |
| endContent | `ReactNode` | 结尾内容槽，位于 children 之后、关闭按钮之前。 |
| children | `ReactNode` | 标签文字。 |

## 示例
```tsx
// soft 三色
<Chip tone="brand">品牌</Chip>
<Chip tone="danger">危险</Chip>

// 可移除标签组
{items.map((t) => (
  <Chip key={t} onClose={() => remove(t)}>{t}</Chip>
))}
```

## 禁忌 / 坑

暂无已知坑。前导内容互斥优先级为 `avatar > startContent > dot`——三者同传只渲染 avatar。要出现 × 关闭按钮必须传 `onClose`（即便回调为空函数）。`isDisabled` 会屏蔽整片指针事件，连 × 也点不动。

关闭按钮的无障碍标签跟随 `ConfigProvider`：`zhCN` 为“移除”，`enUS` 为 “Remove”。为兼容旧自定义 locale，缺少 `components.chip` 时仍回退中文。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
