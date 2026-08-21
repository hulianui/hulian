---
slug: flow
name: Flow
category: data-display
group: collection
tags: []
exports: [Flow, bezierPath, clampZoom, fitViewport, handleOffsetRatio, handlePoint, nodesBounds, screenToCanvas, zoomAtPoint]
status: enriched
---

# Flow

> Edits controlled node-and-edge canvases with node dragging, edge connection, panning, zooming, and fit view. · data-display/collection

## When to use

Use Flow to build a visual AI workflow, process, or DAG editor with controlled nodes and edges. Use [Kanban](../kanban/kanban.md) for cards moving between columns or [Sortable](../sortable/sortable.md) for one reorderable list.

## Import
```ts
import { Flow, bezierPath, clampZoom, fitViewport, handleOffsetRatio, handlePoint, nodesBounds, screenToCanvas, zoomAtPoint } from "@hulianui/ui"
```

## Props

`FlowProps<T>` is generic.

| Name | Type | Default | Description |
|------|------|------|------|
| nodes * | FlowNode\<T\>[] | - | Controlled `{ id, position, data, width? }` nodes. |
| edges * | FlowEdge[] | - | Controlled `{ id, source, target, sourceHandle?, targetHandle? }` edges. |
| getHandles * | (node: FlowNode\<T\>) => FlowHandleSpec[] | - | Declares left target and right source handles, distributed vertically in return order. |
| selectedId | string \| null | - | Controlled selected node id. |
| defaultNodeWidth | number | 240 | Default node width in canvas pixels. |
| minZoom | number | 0.35 | Minimum zoom. |
| maxZoom | number | 2 | Maximum zoom. |
| controls | boolean | true | Shows zoom and fit controls. |
| isEdgeAnimated | (edge: FlowEdge) => boolean | - | Enables flow animation for selected edges. |
| className | string | - | Canvas wrapper class; it must establish a height. |
| apiRef | MutableRefObject\<FlowApi \| null\> | - | Exposes fitView, zoomIn, zoomOut, reset, and autoLayout. |

## Events

| Event | Type | Description |
|------|------|------|
| onNodesChange | (nodes: FlowNode\<T\>[]) => void | Returns all node positions after a drag. |
| onConnect | (connection: FlowConnection) => void | Reports a valid output-to-input connection without an id. |
| onEdgesDelete | (ids: string[]) => void | Requests deletion of selected edges. |
| onNodeDelete | (id: string) => void | Requests deletion of the selected node. |
| onSelectNode | (id: string \| null) => void | Reports node or blank-canvas selection. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderNode * | (node: FlowNode\<T\>, state: { selected: boolean }) => ReactNode | Renders node content while Flow owns the frame, handles, and selected state. |
| background | ReactNode \| false | Canvas background; false disables the built-in dot grid. |

## Example
```tsx
const [nodes, setNodes] = useState(initialNodes);
const [edges, setEdges] = useState(initialEdges);
const [selected, setSelected] = useState<string | null>(null);

<div className="h-[420px] w-full overflow-hidden rounded border border-border">
  <Flow<NodeData>
    nodes={nodes}
    edges={edges}
    getHandles={getHandles}
    selectedId={selected}
    onSelectNode={setSelected}
    onNodesChange={setNodes}
    onConnect={(c) => setEdges((p) => [...p, { id: `e${Date.now()}`, ...c }])}
    onEdgesDelete={(ids) => setEdges((p) => p.filter((e) => !ids.includes(e.id)))}
    onNodeDelete={(id) => {
      setNodes((p) => p.filter((n) => n.id !== id));
      setEdges((p) => p.filter((e) => e.source !== id && e.target !== id));
    }}
    renderNode={(n) => <div className="px-3.5 py-2.5">{n.data.title}</div>}
  />
</div>
```

## Usage notes

- The outer element must have a definite height or the canvas is invisible.
- Flow is fully controlled. Add ids and deduplicate new connections; when deleting a node, also remove its incident edges.
- Pointer Events make Flow client-only.
- The similarly named navigation-menu layout note concerns Base UI and does not apply here.
- Built-in Chinese accessibility labels are `"\u5de5\u4f5c\u6d41\u753b\u5e03"` (“Workflow canvas”), `"\u5220\u9664\u8fde\u7ebf"` (“Delete edge”), `"\u653e\u5927"` / `"\u7f29\u5c0f"` (“Zoom in” / “Zoom out”), `"\u9002\u914d\u89c6\u56fe"` (“Fit view”), `"\u667a\u80fd\u6392\u7248"` (“Auto layout”), `"\u5de5\u4f5c\u6d41\u8282\u70b9"` (“Workflow node”), `"\u5220\u9664\u8282\u70b9"` (“Delete node”), and fallback handle labels `"\u8f93\u51fa"` / `"\u8f93\u5165"` (“Output” / “Input”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
