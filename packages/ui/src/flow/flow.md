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

> 编排节点和连线，可拖节点、连桩、平移和缩放 · data-display/collection

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
| nodes * | FlowNode\<T\>[] | - | 受控节点数组（`{ id, position, data, width? }`） |
| edges * | FlowEdge[] | - | 受控连线数组（`{ id, source, target, sourceHandle?, targetHandle?, label? }`）。`label` 可选，见「连线文案」 |
| getHandles * | (node: FlowNode\<T\>) => FlowHandleSpec[] | - | 声明每节点连接桩（左 target/右 source，按返回顺序在该侧均分纵向位置） |
| selectedId | string ｜ null | - | 单选受控：当前选中节点 id |
| defaultNodeWidth | number | 240 | 默认节点宽度（px，画布坐标） |
| minZoom | number | 0.35 | 缩放下限 |
| maxZoom | number | 2 | 缩放上限 |
| controls | boolean | true | 是否显示右下角缩放/适配工具条 |
| isEdgeAnimated | (edge: FlowEdge) => boolean | - | 某条连线是否走流光动画（如运行中链路） |
| className | string | - | 画布外层类名（须有确定高度，组件填满） |
| apiRef | MutableRefObject\<FlowApi ｜ null\> | - | 命令式句柄（fitView / zoomIn / zoomOut / reset / autoLayout） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onNodesChange | (nodes: FlowNode\<T\>[]) => void | 节点拖动后回吐整组新位置（组件不直接改 data） |
| onConnect | (connection: FlowConnection) => void | 从输出桩拖到合法输入桩成功 → 新连接（无 id，你补 id 并去重） |
| onEdgesDelete | (ids: string[]) => void | 删除连线（选中后点 × 或按 Delete） |
| onNodeDelete | (id: string) => void | 删除节点（选中后点 × 或按 Delete） |
| onSelectNode | (id: string ｜ null) => void | 选中变化（点节点=id，点空白=null） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderNode * | (node: FlowNode\<T\>, state: { selected: boolean }) => ReactNode | 渲染节点内容的渲染函数（外框/桩/选中态由组件负责） |
| background | ReactNode ｜ false | 画布底纹（false 关闭）；默认内置点阵 |

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

## 连线文案

`FlowEdge.label` 可选。不传，或去掉空白后为空，这条连线不画标签，点击、删除和读屏结果与没有该字段时相同。

```tsx
{ id: "e1", source: "prompt", target: "model", label: "提示词" }
```

有文案时，标签放在现有贝塞尔中点的一侧（优先在线的上方）。底用表面色，字用前景色，和节点、删除钮同一套 token。长文案在两端桩让出的宽度里换行，不截断，也不另做省略号。

盒子会避开两端连接桩，也会避开选中连线后出现在中点的删除钮。计算只看这一条边的两个端点：交叉、重合或挤在一起的其他连线不参与，那些标签仍可能彼此叠住。

路径画在 `aria-hidden` 的 SVG 里，放进去的文字辅助技术读不到。标签因此挂在这层外面的分组上，分组的可访问名称就是这段文案。视觉上的字再标 `aria-hidden`，避免同一个名字念两遍。这一步只提供名称。键盘逐条选中连线、删除和焦点恢复不在这里。

## 禁忌 / 坑

- 外层 `className` **必须有确定高度**（如 `h-[420px]` 或父级撑满），画布按外层尺寸填充——高度塌缩则画布不可见。
- `label` 可选。缺省或空白时不画标签，点击、删除和读屏结果与没有该字段时相同。
- 标签贴在该连线中点一侧，并让开两端连接桩和选中后的删除钮。它不跟其他标签互相避让：交叉或几乎重合的连线，标签仍可能叠在一起。长文案换行，不截断。
- 连线路径在 `aria-hidden` 的 SVG 里。标签名挂在这层外面，读屏能读到文案。这一步没有键盘逐条选中、删除或焦点恢复。
- 全受控：`onConnect` 回吐的连接**无 id**，你要自己补 id 并去重；`onNodeDelete` 只给节点 id，关联连线要你自己一并清掉（否则留下悬空 edge）。
- 客户端组件（原生 Pointer Events），必须在 client 上下文用。
- 候选坑 `base-ui-navigation-menu-content-must-stay-in-flow-for-popup-size-measure` 仅因「flow」字面匹配，讲的是 Base UI 导航菜单布局，与本组件无关，不引用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
