---
slug: event-stream
name: EventStream
category: data-display
group: collection
tags: []
exports: [EventStream]
status: enriched
---

# EventStream 事件流

> 事件流 · 高频机器事件的连续时间线。语义色是主要信息载体，用来一眼分辨「哪些不对劲」 · data-display/collection

## 什么时候用

- 审计流 / 治理拦截记录
- CI 流水线阶段
- 日志与告警流
- 任何「持续追加、需要快速扫视异常」的序列

## 什么时候不用

| 场景 | 用什么 | 为什么 |
|---|---|---|
| 会话 / 话题列表 | `ThreadList` | 每项是可进入的对话，强调「读到哪了」 |
| 里程碑叙事 | `Timeline` | 稀疏、人工编排、每点都有分量 |
| 按优先级排队的任务 | `QueueLane` | 强调积压与等待，不是时间序 |

## 用法

```tsx
import { EventStream } from "@hulianui/ui";

<EventStream
  items={[
    { id: 1, ts: "09:12:01", tone: "success", title: "构建通过", meta: "2.1s" },
    { id: 2, ts: "09:12:44", tone: "danger", title: "越权写入被拦",
      detail: "目标超出允许范围", meta: "1.3ms" },
  ]}
  maxHeight={320}
  onItemClick={(e) => openDetail(e.id)}
/>
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `items` | `EventStreamItem[]` | — | 顺序即展示顺序，组件不排序 |
| `maxHeight` | `number \| string` | — | 给了才出现内部滚动 |
| `emptyText` | `ReactNode` | `"暂无事件"` | 空态文案 |
| `onItemClick` | `(item) => void` | — | 给了才有可点击态与键盘可达 |
| `live` | `boolean` | `false` | 新条目淡入一次 |
| `side` | `"left" \| "right"` | `"left"` | 时间轴所在侧 |
| `defaultExpanded` | `boolean` | `false` | 是否默认展开 `detail` |

### EventStreamItem

| 名称 | 类型 | 说明 |
|---|---|---|
| `id` | `string \| number` | 稳定唯一；`live` 靠它判断新条目 |
| `ts` | `ReactNode` | 时间显示串 |
| `tone` | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | 语义色，缺省 `neutral` |
| `title` | `ReactNode` | 一行说清发生了什么 |
| `detail` | `ReactNode` | 折叠区内容 |
| `meta` | `ReactNode` | 右对齐尾部信息（耗时 / 编号） |
| `overridden` | `ReactNode` | 已被人工放行时的说明 |

## 设计取舍

**时间不做格式化。** 组件收到什么显示什么。时区、精度、相对还是绝对，都是调用方的领域知识；组件擅自 `toLocaleString` 只会在跨时区场景制造错误。

**`live` 只淡入一次，不做循环动效。** 事件流常年开着，任何持续动画都是噪音。

**首帧不闪。** `live` 模式初次挂载时全部视为「已见」，否则整屏一起动，反而看不出哪条是新的。

**`overridden` 单独成行而非改色。** 「曾被拦但放行了」与「从未被拦」必须视觉可区分——这是审计场景的刚需，把它并进 tone 会丢掉这层信息。
