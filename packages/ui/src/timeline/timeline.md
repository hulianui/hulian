---
slug: timeline
name: Timeline
category: data-display
group: stat
tags: []
exports: [Timeline, TimelineItem]
status: enriched
---

# Timeline

> 时间线 · 复合 Timeline/Item + items 数组 + 彩色节点/自定义 dot + left/right/alternate + pending 加载态(纯皮肤·零依赖·RSC) · data-display/stat

## 何时用

按时间顺序展示一串事件（审批流、物流轨迹、操作历史），每项一个彩色节点 + 内容 + 元信息。要展示单条 git 提交引用用 [GitCommit]（本批近邻 info 组），要展示分步骤的可推进流程用 Steps；本组件是「带连线的纵向事件流」。

## 导入
```ts
import { Timeline, TimelineItem } from "@hulianui/ui"
```

## Props

### Timeline

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `TimelineItemProps[]` | — | 数据驱动：等价于每项渲染 `<TimelineItem {...item} />`；与 children 二选一 |
| mode | `"left" \| "right" \| "alternate"` | `"left"` | 布局方向：left=节点在左/内容在右，right=镜像，alternate=逐项左右交替（中轴） |
| …HTMLAttributes | `Omit<HTMLAttributes<HTMLOListElement>, "children">` | — | 透传 ol 原生属性 |

### TimelineItem

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `"default" \| "primary" \| "success" \| "danger" \| "warning"` | `"default"` | 默认圆点的语气色；自定义 dot 时忽略 |
| pending | `boolean` | — | 标记进行中：默认圆点变加载态（旋转环）；连入此项的竖线由 Timeline 自动转虚线 |
| className | `string` | — | 透传类名 |

## Slots

### Timeline

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 复合用法：直接传若干 `<TimelineItem>`；与 items 二选一 |
| pending | `boolean \| ReactNode` | 末尾追加一个进行中幽灵项（加载态圆点）；true=仅图标，传 ReactNode 作其内容 |

### TimelineItem

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 主内容 |
| dot | `ReactNode` | 自定义节点（如图标）；省略则渲染按 color 着色的默认圆点 |
| label | `ReactNode` | 次要标签（时间戳/元信息），渲染在主内容下方、中性弱化；圆点对齐主内容首行 |

## 示例
```tsx
// 数据驱动（最常见）：审批流，彩色语气
const approval = [
  { label: "09:12", children: "员工提交报销申请", color: "primary" },
  { label: "10:40", children: "直属经理审批通过", color: "success" },
];
<Timeline items={approval} pending="财务复核中" />

// 复合用法：自定义图标节点
<Timeline>
  <TimelineItem label="步骤一" color="success" dot={CheckIcon}>账号注册完成</TimelineItem>
  <TimelineItem label="步骤二" color="primary">绑定收款账户（进行中）</TimelineItem>
</Timeline>
```

## 禁忌 / 坑
- `items` 与 `children` 二选一，不要同时传。
- `label` 是次要元信息（时间戳），渲染在主内容**下方**且圆点对齐主内容首行——不要把正文塞 label。
- `dot` 自定义节点会覆盖 `color`，二者同传时 color 被忽略。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
