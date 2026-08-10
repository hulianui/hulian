---
slug: queue-lane
name: QueueLane
category: data-display
group: collection
tags: []
exports: [QueueLane, groupByLane]
status: enriched
---

# QueueLane

> 优先级队列板 · 优先级泳道队列板 · 横向泳道 + 道头聚合队列指标(深度/平均等待/吞吐) · 只读队列监视器(区别 Kanban 拖拽工作流·FIFO+aging) + maxVisible 折叠「还有 N 条」 + onItemClick · groupByLane 保序分组纯函数带单测 · 任务总线/优先级队列(零依赖) · data-display/collection

## 何时用

监视「按优先级/分类划分的多条有序队列」时用——任务总线、调度队列、按 P0-P3 排队。队列顺序由调度器决定（FIFO），用户不能拖拽改序；要人工拖拽改状态/改顺序的工作流看板用 Kanban。QueueLane 是只读监视器，胜在道头能聚合队列指标。

## 导入
```ts
import { QueueLane, groupByLane } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| lanes* | `QueueLaneDef[]` | — | 泳道定义，顺序即展示顺序。`{id, label, tone?, meta?}`；tone 为 CSS 颜色/token 变量，原样写入 inline style 不做枚举映射 |
| items* | `T[]` | — | 受控队列项数组，按 laneId 分组，道内顺序 = 数组原始顺序（FIFO）。每项须含 `{id, laneId}`；laneId 未命中任一 lane 则该项被丢弃 |
| maxVisible | `number` | — | 每道最多直显条数，超出折叠为「还有 N 条」。缺省不折叠（全显） |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 泳道排布方向。horizontal：泳道横向并列，每道竖向排队 |
| className | `string` | — | 外层类名 |

`QueueItem`（`items` 的元素约束，你的行数据在此之上自由扩展）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id * | `string` | — | 唯一键 |
| laneId * | `string` | — | 所属泳道 id。须命中某个 `lanes[].id`，否则该项被丢弃 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onItemClick | `(item: T) => void` | 点击队列项回调（卡片只读，仅查看/下钻，不改队列顺序） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem* | `(item: T, index: number) => ReactNode` | 渲染函数：渲染单个队列项；index 为该项在所属道内的队列位次（0 = 队首） |
| renderLaneHeader | `(lane: QueueLaneDef, items: T[]) => ReactNode` | 渲染函数：自定义道头（拿该道队列做指标聚合）。缺省渲染 label + 条数 + lane.meta |

## 示例
```tsx
interface Job extends QueueItem { title: string; wait: string; executor: string }

const lanes: QueueLaneDef[] = [
  { id: "p0", label: "P0 紧急", tone: "var(--color-chart-3)", meta: "均等 0.4s" },
  { id: "p1", label: "P1 高", tone: "var(--color-chart-4)", meta: "均等 1.2s" },
];
const jobs: Job[] = [
  { id: "t1", laneId: "p0", title: "实时风控审批", wait: "0.2s", executor: "Sonnet 4.6" },
  { id: "t3", laneId: "p1", title: "工单意图分类", wait: "0.9s", executor: "Haiku 4.5" },
];

<QueueLane<Job>
  lanes={lanes}
  items={jobs}
  maxVisible={5}
  onItemClick={(job) => console.log(job.id)}
  renderItem={(job, index) => (
    <div>#{index + 1} {job.title} · 等 {job.wait}</div>
  )}
/>
```

## 禁忌 / 坑

- items 是受控、FIFO 顺序即数组顺序，组件本身不排序也不允许拖拽——排序/aging 逻辑在调用方完成后再喂进来。
- `item.laneId` 必须命中某条 lane.id，否则该项被静默丢弃（不报错）；新增 lane 时记得同步 laneId 映射。
- lane.tone 原样写入 inline style，可用任意 CSS 颜色；若用 token 变量须带 `--color-` 前缀，见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
