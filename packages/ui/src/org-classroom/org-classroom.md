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

> 组织工位 · Blender 预渲染等距精灵图（分层吃主题色，零运行时依赖）· 单人桌可拼接 · 部门分区、人名、状态气泡 · 点座位看人员卡并改状态 · data-display/collection

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
| view | `ViewAngle` | 非受控，从 `0` 开始 | 观察视角，`0` / `90` / `180` / `270`。每加 90，楼层在屏幕上顺时针转 90° |
| northDeg | `number` | `0` | 真北相对平面图上方顺时针转过的角度，只影响指南针 |
| className | `string` | - | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSeatSelect | `(seatId: string \| null) => void` | 点选座位时得到座位 id。关闭按钮或 Esc 得到 `null`。再点已选中的座位仍得到同一个 id |
| onStatusChange | `(seatId: string, status: SeatStatus) => void` | 在人员卡里改状态。组件不改 `zones` |
| onZoneFocus | `(zoneId: string \| null) => void` | 点分区空白处聚焦；再点一次已聚焦的空白处得到 `null` |
| onViewChange | `(view: ViewAngle) => void` | 点指南针旁的旋转按钮时得到新视角。受控时由你写回 `view` |

## 数据

| 名称 | 类型 | 说明 |
|------|------|------|
| Zone.id | `string` | 分区 id |
| Zone.name | `string` | 部门名，人员卡里的部门 |
| Zone.accent | `string` | CSS 颜色。主题色写 `var(--color-primary)`，不要写 `var(--primary)` |
| Zone.facing | `ZoneFacing` | 这一区的人面朝平面图哪边：`up` / `right` / `down` / `left`，默认 `down`。桌子跟着转，排和列在分区里按人的朝向排 |
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
- `accent` 里的主题变量必须带 `--color-` 前缀。它同时决定分区地板和这一区人的围巾颜色。座位上的人是内部模型，不是头像组件 [Avatar](../avatar/avatar.md)。
- 座位是 Blender 预渲染的精灵图，不是 Three.js / R3F，也不是实时 WebGL。每张图拆成阴影、按颜色组的遮罩和一张白模光照：遮罩填主题色（人吃 `--color-foreground`，桌面吃 `--color-surface`，围巾吃 `accent`），光照用 `multiply` 叠上去，所以换主题、深色模式都不用重新出图。改模型或相机后在本目录跑 `blender -b --factory-startup --python org-classroom-sprites.bake.py`（需要 `cwebp`）重新生成 `org-classroom-sprites.ts`，不要手改它。
- 一人一张单人桌，同一行的桌子并排拼成长条。行列只决定位置，不要用 `row` / `col` 留空当过道：分区之间本来就有过道。
- 点击按像素判断：点到桌椅人身上才算这个座位，点到图片透明处落到分区地板。前后座位图片会重叠，所以不要在外面给座位包一层按矩形接点击的元素。
- 指南针画成平放在地面上的圆的投影，所以北向刻度在等距画面里通常是斜的；它和地板同一个透视，不是画错了。`northDeg` 只转指南针，不转楼层；要让人朝真北，用 `facing` 配合 `northDeg` 自己算。`facing` 只有四个方向，桌子不做任意角度。
- 座位图按「朝向 − 视角」的 4 个相对角各烘一套，`org-classroom-sprites.ts` 约 360KB（WebP data URI）。只用默认朝向和视角也会整体打进包里。
- 排布按组件自身宽度（容器查询）切换：宽于 48rem 时人员卡在右侧，否则在上方。场景缩小到一定比例后，人名气泡收成状态圆点，名字和状态仍在座位按钮的读屏标签和人员卡里。
- 英文文档的代码块同样会被英文站渲染出来。`*.en.md` 的围栏里不要写「在岗 / 忙碌 / 会议中 / 休假 / 面试中」。`docs:i18n:check` 会报 `fenced-cjk`；只查正文、放行围栏，会绿到静态导出之后的英文产物门禁和 showcase 浏览器门禁才红。

## 相关
[Card](../card/card.md) · [Tag](../tag/tag.md) · [Button](../button/button.md) · [Badge](../badge/badge.md) · [Kanban](../kanban/kanban.md) · [Scheduler](../scheduler/scheduler.md)
