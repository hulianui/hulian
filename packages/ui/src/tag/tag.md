---
slug: tag
name: Tag
category: data-display
group: info
tags: []
exports: [Tag, tagVariants]
status: enriched
---

# Tag

> 状态标签 · 5 语气状态色 + 状态圆点/呼吸进行态(pulse) + 图标 + 可关闭(企业状态标记·区别 Chip 令牌) · data-display/info

## 何时用

表达对象状态/类别的小标记（运行中、待审核、已驳回等），支持状态圆点与呼吸动画表达进行态。展示数值/计数徽记用 [[Badge]]；可输入/可移除的过滤令牌用 Chip，本组件偏只读状态标记。

## 导入
```ts
import { Tag, tagVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"soft" \| "solid" \| "outline"` | `"soft"` | 视觉变体：soft 浅底（最常用于状态标签）/ solid 实底 / outline 描边。 |
| tone | `"neutral" \| "brand" \| "success" \| "warning" \| "danger"` | `"neutral"` | 语气色。 |
| size | `"sm" \| "md"` | `"md"` | 尺寸。 |
| dot | `boolean` | `false` | 前导状态圆点（颜色随 tone）。与 icon 互斥：icon 优先于 dot。 |
| pulse | `boolean` | `false` | 圆点呼吸动画（进行态语义）。仅在 dot 为真时生效。 |
| isDisabled | `boolean` | `false` | 禁用：降透明度、屏蔽指针事件、关闭按钮不可点。 |
| className | `string` | — | — |
| …HTMLAttributes | `HTMLAttributes<HTMLSpanElement>` | — | 透传 span 原生属性。状态标签常用 `title` 挂完整值做 hover 全文（表格里显示「Word」、title 是完整 MIME），以及 `data-testid` / `aria-*` |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClose | `() => void` | 提供则渲染关闭(×)按钮，点击触发该回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 前导图标槽；存在时不渲染 dot。 |
| children | `ReactNode` | 标签文本。 |

## 示例
```tsx
// 状态语气
<Tag>默认</Tag>
<Tag tone="success">成功</Tag>
<Tag tone="danger">错误</Tag>
```
```tsx
// 呼吸圆点表达进行态 + 可关闭
<Tag dot pulse tone="brand">部署中</Tag>
<Tag onClose={() => remove(id)}>待审核</Tag>
```

## 禁忌 / 坑

- `pulse` 只在 `dot` 为真时生效，单独传 `pulse` 无动画。
- `icon` 与 `dot` 互斥，同传时只渲染 `icon`——想要圆点就别传 icon。
- `onClose` 列表场景需自行维护移除后的状态（受控数组 filter），组件本身不删元素。
- 关闭按钮的无障碍标签跟随 `ConfigProvider`：`zhCN` 为“移除”，`enUS` 为 “Remove”。旧自定义 locale 缺少 `components.tag` 时回退中文。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
