---
slug: gantt
name: Gantt
category: data-display
group: collection
tags: []
exports: [Gantt]
status: enriched
---

# Gantt

> 把任务排到时间轴上，展示分组、进度和今天的位置 · data-display/collection

## 何时用

只读展示「项目排期/工序时间线」时用——施工排期、迭代计划、含进度的任务条。条形不可拖拽改期（纯展示）；要拖拽编辑日期/时长用 Scheduler（事件日历）。要看依赖流向用 Flow。Gantt 胜在零依赖、自带 UTC 日期数学、CSS grid 渲染。

## 导入
```ts
import { Gantt } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`（除 children）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tasks* | `GanttTask[]` | - | 任务列表（只读，不可拖拽改期） |
| rangeStart | `string` | - | 时间轴起点 `"YYYY-MM-DD"`；省略自动取最早 start 并向前留 padding |
| rangeEnd | `string` | - | 时间轴终点 `"YYYY-MM-DD"`；省略自动取最晚 end 并向后留 padding |
| unit | `"day" \| "week" \| "month"` | `"day"` | 表头刻度密度（week 周一起）；仅影响刻度，不改条形定位 |
| today | `string` | - | 今日竖线日期 `"YYYY-MM-DD"`；落在范围内才绘制 |
| rowHeight | `number` | `36` | 每行高度（px） |
| className | `string` | - | 外层类名 |

GanttTask：`{id, name, start, end, progress?, group?, color?}`。start/end 为 `"YYYY-MM-DD"` 闭区间（含首尾两端）；progress 0-100 驱动条内深色填充层；相同 group 在左列以小标题聚拢；color 为 CSS 颜色（token var() 或 hex），省略走主题 primary。

## 示例
```tsx
const tasks: GanttTask[] = [
  { id: "t1", name: "现场勘测", start: "2026-06-01", end: "2026-06-05", progress: 100, group: "前期" },
  { id: "t3", name: "主体施工", start: "2026-06-08", end: "2026-06-24", progress: 60, group: "施工" },
  { id: "t5", name: "竣工验收", start: "2026-07-01", end: "2026-07-06", progress: 0, group: "收尾" },
];

<Gantt tasks={tasks} unit="week" today="2026-06-18" />
```

## 禁忌 / 坑

- 日期字符串是闭区间 `"YYYY-MM-DD"`，组件用 UTC 日期数学避开时区漂移——别传带时分或本地时区偏移的 ISO datetime（那是 Scheduler 的输入）。
- color 用 token 变量时须带 `--color-` 前缀（`var(--color-chart-2)`），裸变量不解析，见 [[hulian-token-color-var-needs-color-prefix]]。
- 时间轴可能比容器宽，组件靠横向滚动——外层给确定宽度（如 `w-[680px] max-w-full`）才有滚动条。

## 相关

图表标签、空态、左列标题与月份刻度跟随 `ConfigProvider`。
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
