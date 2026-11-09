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
| edges * | FlowEdge[] | - | Controlled `{ id, source, target, sourceHandle?, targetHandle?, label? }` edges. `label` is optional; see Edge labels. |
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

## Edge labels

`FlowEdge.label` is optional. Omit it, or pass only whitespace, and that edge draws no label. Pointer interaction, deletion, and the accessibility tree stay the same as an edge without the field.

```tsx
{ id: "e1", source: "prompt", target: "model", label: "Prompt" }
```

When the text is present, the chip sits beside the existing bezier midpoint, preferring the upper side. It uses the surface background and foreground text, the same tokens as nodes and the delete button. Long text wraps inside the width left between the two connector ports. It is not truncated and it does not turn into an ellipsis.

The box stays off both connector ports and off the delete button that appears at the midpoint of a selected edge. Placement looks only at that edge's own endpoints. Crossing, coincident, or tightly packed edges are not separated from each other, so their labels can still overlap.

The path is drawn in an `aria-hidden` SVG, which means text inside that layer is not exposed to assistive technology. The label is a group outside that layer, and the group's accessible name is the label text. The visible characters are `aria-hidden` so the name is not announced twice. This slice exposes the name only. It does not add per-edge keyboard selection, deletion, or focus restoration.

## Usage notes

- The outer element must have a definite height or the canvas is invisible.
- `label` is optional. When it is omitted or blank, the edge draws no label, and pointer, delete, and screen-reader behavior match an edge without the field.
- A label sits beside that edge's midpoint and stays off both connector ports and the selected edge's delete button. Labels do not avoid each other: crossing or nearly coincident edges can still stack their labels. Long text wraps and is not truncated.
- Edge paths live in an `aria-hidden` SVG. The label name is outside that layer, so assistive technology can read the text. This slice does not add per-edge keyboard selection, deletion, or focus restoration.
- Flow is fully controlled. Add ids and deduplicate new connections; when deleting a node, also remove its incident edges.
- Pointer Events make Flow client-only.
- The similarly named navigation-menu layout note concerns Base UI and does not apply here.
- Built-in Chinese accessibility labels are `"\u5de5\u4f5c\u6d41\u753b\u5e03"` (“Workflow canvas”), `"\u5220\u9664\u8fde\u7ebf"` (“Delete edge”), `"\u653e\u5927"` / `"\u7f29\u5c0f"` (“Zoom in” / “Zoom out”), `"\u9002\u914d\u89c6\u56fe"` (“Fit view”), `"\u667a\u80fd\u6392\u7248"` (“Auto layout”), `"\u5de5\u4f5c\u6d41\u8282\u70b9"` (“Workflow node”), `"\u5220\u9664\u8282\u70b9"` (“Delete node”), and fallback handle labels `"\u8f93\u51fa"` / `"\u8f93\u5165"` (“Output” / “Input”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
