---
slug: org-classroom
name: OrgClassroom
category: data-display
group: collection
tags: []
exports: [OrgClassroom, updateSeatStatus]
status: enriched
---

# OrgClassroom

> 组织工位 · CSS 等距平面（rotateX + rotateZ）+ SVG 桌子 / 剪影 · 部门分区、人名、状态气泡 · 点座位看人员卡并改状态 · data-display/collection

## 何时用

要在一页里看见「谁坐在哪个部门、现在什么状态」时用。它是一块可点的工位平面，不是三维场景。顶栏 KPI、面试间、档案侧栏由页面自己用 [Card](../card/card.md) / [Badge](../badge/badge.md) 拼，不进这个组件。

## 导入
```ts
import { OrgClassroom, updateSeatStatus } from "@hulianui/ui"
import type { Seat, SeatStatus, Zone } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| zones* | `Zone[]` | - | 部门分区 |
| selectedSeatId | `string \| null` | 非受控 | 当前选中的座位。传 `null` 表示没选中 |
| focusedZoneId | `string \| null` | 非受控 | 当前聚焦的分区。传 `null` 表示没有聚焦 |
| className | `string` | - | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSeatSelect | `(seatId: string \| null) => void` | 点选座位时得到座位 id。关闭按钮或 Esc 得到 `null`。再点已选中的座位仍得到同一个 id |
| onStatusChange | `(seatId: string, status: SeatStatus) => void` | 在人员卡里改状态。组件不改 `zones` |
| onZoneFocus | `(zoneId: string \| null) => void` | 点分区空白处聚焦；再点一次已聚焦的空白处得到 `null` |

## 数据

| 名称 | 类型 | 说明 |
|------|------|------|
| Zone.id | `string` | 分区 id |
| Zone.name | `string` | 部门名，人员卡里的部门 |
| Zone.accent | `string` | CSS 颜色。主题色写 `var(--color-primary)`，不要写 `var(--primary)` |
| Zone.seats | `Seat[]` | 工位 |
| Seat.id | `string` | 座位 id，整层楼唯一 |
| Seat.row | `number` | 行，从 1 开始 |
| Seat.col | `number` | 列，从 1 开始 |
| Seat.person | `SeatPerson` | 不传就是空位 |
| SeatPerson.id | `string` | 人员 id |
| SeatPerson.name | `string` | 姓名 |
| SeatPerson.status | `SeatStatus` | `idle` / `busy` / `meeting` / `leave` / `interview` |

`SeatStatus` 的默认气泡文案：

| 状态 | 默认文案 |
|------|------|
| idle | 在岗 |
| busy | 忙碌 |
| meeting | 会议中 |
| leave | 休假 |
| interview | 面试中 |

## 示例
```tsx
const [zones, setZones] = useState<Zone[]>([
  {
    id: "design",
    name: "产品设计部",
    accent: "var(--color-primary)",
    seats: [
      { id: "d1", row: 1, col: 1, person: { id: "p1", name: "林予涵", status: "idle" } },
      { id: "d2", row: 1, col: 2 },
    ],
  },
]);

<OrgClassroom
  zones={zones}
  onStatusChange={(seatId, status) => setZones((current) => updateSeatStatus(current, seatId, status))}
/>
```

## 禁忌 / 坑

- 空座位不渲染状态气泡。默认文案就是「在岗 / 忙碌 / 会议中 / 休假 / 面试中」。英文产品在根上挂 `ConfigProvider locale={enUS}`，不要在调用处改这五个字。
- 状态是受控的。人员卡只调用 `onStatusChange`，下一帧的气泡来自你写回的 `person.status`。用 `updateSeatStatus` 可以保持没改动的座位引用。气泡用透明度过渡，不要靠 `key={status}` 把整颗气泡卸掉重挂。
- 点座位是选中，点分区里桌子以外的空白才是聚焦。再点一次已聚焦分区的空白会清空聚焦，**不会**关掉人员卡。再点一次已经选中的座位也**不会**关闭，只会再次交出同一个座位 id。关闭只有两条：卡片上的「关闭人员卡」，或焦点在组件里时按 Esc。两条都会把选中清成 `null`（受控时要由 `onSeatSelect(null)` 写回 `selectedSeatId`），并把焦点还到打开这张卡的座位按钮上。v1 没有拖拽换座、多选，也没有平移缩放。
- `accent` 里的主题变量必须带 `--color-` 前缀。座位上的人是内部剪影，不是头像组件 [Avatar](../avatar/avatar.md)。
- 这是 CSS 等距舞台加 SVG，不是 Three.js / R3F。中间层如果加了 `opacity` 以外的滤镜，或把 `overflow: hidden` 套在旋转平面上，抬起和正对屏幕的人名会扁掉。人名上也不要再用 `truncate`：它会把标签裁成 `overflow: hidden`，3D 舞台就此被压扁。
- 英文文档的代码块同样会被英文站渲染出来。`*.en.md` 的围栏里不要写「在岗 / 忙碌 / 会议中 / 休假 / 面试中」。`docs:i18n:check` 会报 `fenced-cjk`；只查正文、放行围栏，会绿到静态导出之后的英文产物门禁和 showcase 浏览器门禁才红。

## 相关
[Card](../card/card.md) · [Tag](../tag/tag.md) · [Button](../button/button.md) · [Badge](../badge/badge.md) · [Kanban](../kanban/kanban.md) · [Scheduler](../scheduler/scheduler.md)
