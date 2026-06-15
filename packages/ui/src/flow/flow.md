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

> 节点画布编排器 · 零依赖原生 Pointer Events + SVG 贝塞尔连线 · 拖节点/拖桩连线/平移缩放/适配视图 + 受控 nodes/edges(onNodesChange/onConnect/删点删线) + renderNode 自定义节点内容 · 几何抽纯函数带单测 · AI 工作流/流程编排旗舰 · data-display/collection

## 何时用

节点画布式可视化编排（AI 工作流、流程/DAG 编辑、节点连线图），受控 `nodes`/`edges` + 拖节点/拖桩连线/平移缩放/适配视图。只需多列卡片流转用 [Kanban](../kanban/kanban.md)；单列表排序用 [Sortable](../sortable/sortable.md)。

## 导入
```ts
import { Flow, bezierPath, clampZoom, fitViewport, handleOffsetRatio, handlePoint, nodesBounds, screenToCanvas, zoomAtPoint } from "@hulianui/ui"
```

## Props

`FlowProps<T>` 泛型。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| nodes * | FlowNode\<T\>[] | — | 受控节点数组（`{ id, position, data, width? }`） |
| edges * | FlowEdge[] | — | 受控连线数组（`{ id, source, target, sourceHandle?, targetHandle? }`） |
| getHandles * | (node: FlowNode\<T\>) => FlowHandleSpec[] | — | 声明每节点连接桩（左 target/右 source，按返回顺序在该侧均分纵向位置） |
| renderNode * | (node: FlowNode\<T\>, state: { selected: boolean }) => ReactNode | — | 渲染节点内容（外框/桩/选中态由组件负责） |
| onNodesChange | (nodes: FlowNode\<T\>[]) => void | — | 节点拖动后回吐整组新位置（组件不直接改 data） |
| onConnect | (connection: FlowConnection) => void | — | 从输出桩拖到合法输入桩成功 → 新连接（无 id，你补 id 并去重） |
| onEdgesDelete | (ids: string[]) => void | — | 删除连线（选中后点 × 或按 Delete） |
| onNodeDelete | (id: string) => void | — | 删除节点（选中后点 × 或按 Delete） |
| selectedId | string ｜ null | — | 单选受控：当前选中节点 id |
| onSelectNode | (id: string ｜ null) => void | — | 选中变化（点节点=id，点空白=null） |
| defaultNodeWidth | number | 240 | 默认节点宽度（px，画布坐标） |
| minZoom | number | 0.35 | 缩放下限 |
| maxZoom | number | 2 | 缩放上限 |
| controls | boolean | true | 是否显示右下角缩放/适配工具条 |
| background | ReactNode ｜ false | 内置点阵 | 画布底纹（false 关闭） |
| isEdgeAnimated | (edge: FlowEdge) => boolean | — | 某条连线是否走流光动画（如运行中链路） |
| className | string | — | 画布外层类名（须有确定高度，组件填满） |
| apiRef | MutableRefObject\<FlowApi ｜ null\> | — | 命令式句柄（fitView / zoomIn / zoomOut / reset / autoLayout） |

## 示例
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

## 禁忌 / 坑

- 外层 `className` **必须有确定高度**（如 `h-[420px]` 或父级撑满），画布按外层尺寸填充——高度塌缩则画布不可见。
- 全受控：`onConnect` 回吐的连接**无 id**，你要自己补 id 并去重；`onNodeDelete` 只给节点 id，关联连线要你自己一并清掉（否则留下悬空 edge）。
- 客户端组件（原生 Pointer Events），必须在 client 上下文用。
- 候选坑 `base-ui-navigation-menu-content-must-stay-in-flow-for-popup-size-measure` 仅因「flow」字面匹配，讲的是 Base UI 导航菜单布局，与本组件无关，不引用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
