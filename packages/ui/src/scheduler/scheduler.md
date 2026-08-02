---
slug: scheduler
name: Scheduler
category: data-display
group: collection
tags: []
exports: [Scheduler, dateOf, dayColumns, eventRect, hourLines, layoutColumns, minutesOfDay, minutesToISO, monthMatrix, resourceColumns, snap, startOfWeekISO, weekColumns, yToMinutes]
status: enriched
---

# Scheduler

> 事件日历/排班 · 库首个事件日历件 · 月/周/日/资源四视图(横轴资源·纵轴时间) + 时间轴网格事件块 + 重叠并排 + 当前时间红线 · 零依赖原生 PointerEvents 拖空白建预约/拖事件改期/拖下缘改时长(全 snap 到 slot) · 受控 events/view/date(onEventsChange/onSlotDragCreate/onEventClick) + 内置 toolbar(前/今/后 + Segmented 视图) + renderEvent 自定义事件块 · 几何抽纯函数带单测 · 预约/排班旗舰 · data-display/collection

## 何时用

需要可交互的「事件日历/排班台」时用——预约、诊室排班、资源时间线，支持拖空白建预约、拖事件改期、拖下缘改时长。只读展示项目工序排期用 Gantt（不可拖拽）；纯月历选日期用 Calendar/DatePicker。Scheduler 是带时间轴网格 + 拖拽编辑的旗舰排班件。

## 导入
```ts
import { Scheduler, dateOf, dayColumns, eventRect, hourLines, layoutColumns, minutesOfDay, minutesToISO, monthMatrix, resourceColumns, snap, startOfWeekISO, weekColumns, yToMinutes } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| events* | `SchedulerEvent[]` | — | 受控事件数组。`{id, title, start, end, resourceId?, tone?, subtitle?}`；start/end 为 ISO datetime（含时分，本地时区） |
| view* | `"month" \| "week" \| "day" \| "resource"` | — | 受控视图 |
| date* | `string` | — | 受控焦点日（ISO），决定哪周/哪天/哪月 |
| resources | `SchedulerResource[]` | — | resource 视图必填。`{id, title, subtitle?}` |
| dayStartHour | `number` | `8` | 时间轴起始小时 |
| dayEndHour | `number` | `20` | 时间轴结束小时 |
| slotMinutes | `number` | `30` | 吸附粒度（分钟） |
| hourHeight | `number` | `56` | 每小时像素高 |
| toolbar | `boolean` | `true` | 内置头部工具条（标题 + 前/今/后 + Segmented 视图） |
| className | `string` | — | 外层类名（须有确定高度，组件填满时间轴可滚） |

SchedulerEvent.tone：`"primary" \| "success" \| "warning" \| "danger" \| "neutral"`，默认 primary（仅用已定义语义 token）。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onViewChange | `(v: SchedulerView) => void` | 视图切换（内置 toolbar Segmented） |
| onDateChange | `(iso: string) => void` | 焦点日切换（前/今/后、点月视图某天） |
| onEventsChange | `(events: SchedulerEvent[]) => void` | 拖移/拖改时长提交：回吐整组新 events（照 Kanban 受控范式） |
| onSlotDragCreate | `(slot: SchedulerSlot) => void` | 空白竖拖创建（拖出一段时间） |
| onSlotClick | `(slot: SchedulerSlot) => void` | 点空白格（无拖动）创建 |
| onEventClick | `(event: SchedulerEvent) => void` | 点事件块 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderEvent | `(event: SchedulerEvent) => ReactNode` | 渲染函数：自定义事件块内容（外框/定位/拖拽手柄由组件负责） |

## 示例
```tsx
const [events, setEvents] = useState<SchedulerEvent[]>(INITIAL);
const [view, setView] = useState<SchedulerView>("week");
const [date, setDate] = useState("2026-06-15");

<div className="h-[520px] w-full">
  <Scheduler
    className="h-full"
    events={events}
    view={view}
    date={date}
    resources={resources}
    onViewChange={setView}
    onDateChange={setDate}
    onEventsChange={setEvents}
    onSlotDragCreate={(slot) =>
      setEvents((prev) => [
        ...prev,
        { id: `n-${slot.start}`, title: "新预约", start: slot.start, end: slot.end, resourceId: slot.resourceId ?? "d1", tone: "primary" },
      ])
    }
  />
</div>
```

## 禁忌 / 坑

- 全受控：events/view/date 由消费者持有，拖拽不会自动改 state——必须接 `onEventsChange` 回吐整组并 setState，否则拖完弹回原位（照 Kanban 范式）。
- 外层须给确定高度（如 `h-[520px]` + `className="h-full"`），时间轴靠容器高度填满后才内部滚动；不给高度会塌缩。
- tone 只接受 5 个语义枚举，刻意避开未定义色的静默回退；要任意配色走 `renderEvent`。
- start/end 是含时分的 ISO datetime（本地时区解释），区别于 Gantt 的纯日期闭区间。
- 内置工具条、星期、日期标题和「更多」文案读取 `ConfigProvider` 的 `locale.components.scheduler`。`zhCN` / `enUS` 已内置；旧版自定义 locale 未提供该可选字段时继续回退中文，不影响现有消费者。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
