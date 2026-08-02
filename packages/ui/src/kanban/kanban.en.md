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

> Kanban · controlled dnd-kit multi-container board with cross-column and within-column movement, keyboard support, header metrics, and empty-column targets · data-display/collection

## When to use

Use Kanban for controlled deal, task, or ticket movement across workflow columns. Use [Sortable](../sortable/sortable.md) for one list or [Flow](../flow/flow.md) for a connected node canvas.

## Import
```ts
import { Kanban, resolveKanbanMove } from "@hulianui/ui"
```

## Props

`KanbanProps<T>` is generic.

| Name | Type | Default | Description |
|------|------|------|------|
| columns * | KanbanColumn[] | — | Ordered `{ id, title, header?, footer? }` definitions. |
| items * | T[] | — | Controlled cards grouped by `getColumnId`; array order defines order within a column. |
| getId * | (item: T) => string | — | Globally stable unique card id. |
| getColumnId * | (item: T) => string | — | Current column id. |
| className | string | — | Board class name. |
| columnClassName | string | — | Class applied to each column. |

## Events

| Event | Type | Description |
|------|------|------|
| onMove * | (e: KanbanMoveEvent) => void | Reports a completed move; the consumer updates business fields and state. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem * | (item: T, state: { dragging: boolean }) => ReactNode | Renders one card. |
| renderColumnHeader | (column: KanbanColumn, items: T[]) => ReactNode | Custom header with access to column cards; defaults to header or title. |

`KanbanMoveEvent` is `{ id, fromColumn, toColumn, toIndex }`; `toIndex` is calculated after removing the dragged card from its target column.

## Example
```tsx
const [cards, setCards] = useState(initial);
<Kanban
  items={cards}
  columns={columns}
  getId={(c) => c.id}
  getColumnId={(c) => c.status}
  onMove={(e) => setCards((prev) => applyMove(prev, e))}
  renderColumnHeader={(col, its) => <div>{col.title}<Tag>{its.length}</Tag></div>}
  renderItem={(c) => <Card>{c.title}</Card>}
/>
```

## Usage notes

- Kanban never mutates cards. Update the column field and insert at `toIndex`, or use `resolveKanbanMove`.
- `toIndex` assumes the dragged card has already been removed, including for same-column moves.
- IDs must be globally unique. Interactive descendants also rely on the guard described in [[dnd-kit-draggable-container-guard-interactive-children]].
- Empty columns show built-in Chinese `"\u62d6\u62fd\u5361\u7247\u5230\u6b64"`, meaning “Drag a card here.”

## Related

The empty-column message follows `ConfigProvider`.
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
