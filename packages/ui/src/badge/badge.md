---
slug: badge
name: Badge
category: data-display
group: info
tags: []
exports: [Badge]
status: enriched
---

# Badge

> 计数角标 · count/max 溢出 + dot + 自定义内容 + 包裹叠加(四角/offset) · data-display/info

## 何时用

在图标/头像等宿主上叠加未读计数、红点或小勾时用（消息数、在线点、绿勾认证）。它表达「数量/有无」并叠加到宿主四角；要表达「分类/状态文字标签且可移除」用 [Chip](../chip/chip.md)；只要一个独立的语义状态圆点用 [Dot](../dot/dot.md)。

## 导入
```ts
import { Badge } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| count | `number` | — | 数字计数；为 0 时默认隐藏（除非 showZero）。 |
| max | `number` | `99` | 超过则显示 `max+`。 |
| dot | `boolean` | `false` | 仅显示小圆点不显示数字（优先级高于 count）。 |
| showZero | `boolean` | `false` | count=0 仍显示。 |
| invisible | `boolean` | — | 强制隐藏角标，保留被包裹子元素。 |
| tone | `"neutral"｜"brand"｜"success"｜"warning"｜"danger"` | `danger` | 语气色（默认通知红）。 |
| size | `"sm"｜"md"` | `md` | 尺寸。 |
| placement | `"top-right"｜"top-left"｜"bottom-right"｜"bottom-left"` | `top-right` | 有 children 时角标叠加的角位。 |
| offset | `[number, number]` | — | 角标位置微调 [x, y] px（正值=右/下），圆形宿主常用来外推贴边。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| content | `ReactNode` | 自定义角标内容（如图标 ✓），优先级最高，覆盖 count/dot。 |
| children | `ReactNode` | 被叠加的宿主元素；不传则角标独立渲染。 |

## 示例
```tsx
// 独立计数 + 溢出
<Badge count={1000} max={99} />

// 头像右下角在线点
<Badge dot tone="success" placement="bottom-right">
  <Avatar fallback="瑚" />
</Badge>
```

## 禁忌 / 坑

暂无已知坑。优先级链记牢：`content` > `dot` > `count`——同时传只生效最高者。`count=0` 默认隐藏整个角标，要显示「0」须显式 `showZero`。圆形宿主（头像）四角贴边常需 `offset` 外推几像素。候选坑 `workflow-badge-denominator-numerator-alignment` 讲的是工作流进度「分子/分母」对齐，与本计数角标无关，不适用。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Dot](../dot/dot.md)
