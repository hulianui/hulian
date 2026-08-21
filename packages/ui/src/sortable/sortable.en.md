---
slug: sortable
name: Sortable
category: data-display
group: collection
tags: []
exports: [Sortable]
status: enriched
---

# Sortable

> Drag sorting · controlled dnd-kit list with keyboard dragging, handle or whole-item activation, and horizontal or vertical layout · data-display/collection

## When to use

Use Sortable to reorder one list of columns, tags, or form fields. Use [Kanban](../kanban/kanban.md) for cross-column movement or [Flow](../flow/flow.md) for a connected node canvas.

## Import
```ts
import { Sortable } from "@hulianui/ui"
```

## Props

`SortableProps<T>` is generic.

| Name | Type | Default | Description |
|------|------|------|------|
| items * | T[] | - | Controlled array; write the reordered array from `onChange` back to state. |
| getId | (item: T) => UniqueIdentifier | Reads `item.id` | Returns a stable unique id. |
| orientation | `"vertical"\|"horizontal"` | `"vertical"` | List direction. |
| handle | boolean | false | Restricts dragging to a visible handle; otherwise the whole noninteractive item is draggable. |
| className | string | - | Container class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange * | (items: T[]) => void | Returns the array after drag or keyboard movement. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem * | (item: T, state: SortableItemState) => ReactNode | Renders an item with `dragging` and zero-based `index`. |

`SortableItemState`:

| Field | Type | Description |
|------|------|------|
| dragging | boolean | Whether this item is currently dragged. |
| index | number | Current zero-based index, useful for numbering and unique labels without an O(n²) lookup. |

## Examples
```tsx
const [items, setItems] = useState(fields);
<Sortable items={items} onChange={setItems} handle renderItem={(f) => <div>{f.label}</div>} />

<Sortable items={tags} orientation="horizontal" onChange={setTags}
  renderItem={(t) => <span>{t.name}</span>} />

<Sortable
  items={questions}
  onChange={setQuestions}
  renderItem={(q, { index }) => (
    <div className="flex items-center gap-2">
      <span>Question {index + 1}</span>
      <span className="flex-1 truncate">{q.title}</span>
      <input type="number" value={q.score} aria-label={`Score for question ${index + 1}`} onChange={...} />
      <button type="button" aria-label={`Delete question ${index + 1}`} onClick={...}>Delete</button>
    </div>
  )}
/>
```

## Usage notes

- The component is controlled; `onChange` does not mutate state.
- IDs must be stable and unique. Array indices break identity after reordering.
- Inputs, controls, links, and contenteditable descendants are guarded from pointer dragging even when `handle={false}`; see [[dnd-kit-draggable-container-guard-interactive-children]]. Add `data-no-drag` to custom interactive canvases.
- The guard stops at the item element and will not lock the list because an outer anchor or label exists.
- Use `state.index` instead of repeatedly calling `items.findIndex`.
- Drag-handle accessible labels follow `ConfigProvider locale`; `enUS` provides “Reorder item N”, while the no-provider fallback remains Chinese.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
