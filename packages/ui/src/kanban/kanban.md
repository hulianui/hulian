---
slug: kanban
name: Kanban
category: data-display
group: collection
tags: []
exports: [Kanban, resolveKanbanMove]
status: enriched
---

# Kanban

> 把卡片在多个状态列之间拖动流转 · data-display/collection

## 何时用

多列拖拽流转（商机看板、任务流、工单状态推进），卡片跨列/列内重排，受控数据 + `onMove` 回吐落定事件由你改业务字段。单列表内排序用 [Sortable](../sortable/sortable.md)；节点连线画布用 [Flow](../flow/flow.md)。

## 导入
```ts
import { Kanban, resolveKanbanMove } from "@hulianui/ui"
```

## Props

`KanbanProps<T>` 泛型。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| columns * | KanbanColumn[] | - | 列定义（顺序即展示顺序）。每列 `{ id, title, header?, footer? }` |
| items * | T[] | - | 受控卡片数组；组件按 getColumnId 分桶，列内顺序 = 数组原始顺序 |
| getId * | (item: T) => string | - | 取卡片稳定 id（全局唯一且稳定） |
| getColumnId * | (item: T) => string | - | 取卡片当前所属列 id |
| className | string | - | 容器类名 |
| columnClassName | string | - | 单列类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onMove * | (e: KanbanMoveEvent) => void | 拖拽落定回调；组件不直接改 T，由你据此改状态 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem * | (item: T, state: { dragging: boolean }) => ReactNode | 渲染单张卡片的渲染函数；`state.dragging` 表示正被拖拽 |
| renderColumnHeader | (column: KanbanColumn, items: T[]) => ReactNode | 自定义列头的渲染函数（拿该列卡片做统计）；缺省渲染 `column.header ?? column.title` |

`KanbanMoveEvent`：`{ id, fromColumn, toColumn, toIndex }`。`toIndex` = 目标列内（已剔除被拖卡片后）的插入下标。

## 示例
```tsx
const [cards, setCards] = useState(initial);

<Kanban
  items={cards}
  columns={columns}
  getId={(c) => c.id}
  getColumnId={(c) => c.status}
  onMove={(e) => setCards((prev) => applyMove(prev, e))}
  renderColumnHeader={(col, its) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{col.title}</span>
      <Tag tone="neutral" size="sm">{its.length}</Tag>
    </div>
  )}
  renderItem={(c) => <Card>{c.title}</Card>}
/>
```

## 禁忌 / 坑

- 受控且组件**不替你改卡片**：`onMove` 只回吐事件，你要在回调里改卡片的列字段并按 `toIndex` 插回（可用导出的 `resolveKanbanMove` 辅助）。这是有意为之——避免组件越界写你的业务字段。
- `toIndex` 是「剔除被拖卡片后」目标列的插入下标，落库逻辑要照此剔除再插入，否则跨列同列重排会算偏。
- `getId` 须全局唯一且稳定（不仅列内唯一）；卡片含交互子元素时同样要防拖拽拦截点击（[[dnd-kit-draggable-container-guard-interactive-children]]）。

## 相关

空列占位文案跟随 `ConfigProvider`。
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
