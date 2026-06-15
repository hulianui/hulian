---
slug: sankey
name: Sankey
category: data-display
group: collection
tags: []
exports: [Sankey, assignLayers, computeSankeyLayout]
status: enriched
---

# Sankey

> 桑基图(库内首个) · 多层流向/分配比例 · 零依赖 SVG ribbon · 拓扑自动分层(未给 layer 按 links 推) + 节点高度/流宽按 value 占比 + 跨层一致比例尺(值域守恒) · hover 高亮关联链路 tooltip + 点击节点/连线下钻 · 调度流向/流量来源/预算分配/转化路径旗舰 · data-display/collection

## 何时用

需要可视化「多层之间的流量分配/转化」时用——如任务调度流向、预算在能力域间的分摊、转化路径。要看单一漏斗各级的流失用 [PricingTable] 旁的 Funnel；只展示扁平表格数据用 [Table]/[ProTable]，Sankey 专门表达「跨层守恒的有向流」。

## 导入
```ts
import { Sankey, assignLayers, computeSankeyLayout } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| nodes* | `SankeyNode[]` | — | 节点。`{id, label?, layer?, tone?}`；不给 layer 按 links 拓扑推导（source 层 < target 层）；tone 为 CSS 颜色或 token 变量如 `var(--color-chart-3)` |
| links* | `SankeyLink[]` | — | 连线。`{source, target, value, tone?}`；流宽按 value 占比 |
| height | `number` | `320` | 容器高 |
| nodeWidth | `number` | `16` | 节点矩形宽 |
| nodePadding | `number` | `12` | 同层节点间垂直间隔 |
| linkOpacity | `number` | `0.35` | ribbon 描边透明度（hover 提至 0.6） |
| className | `string` | — | 外层类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onNodeClick | `(node: SankeyLaidNode) => void` | 点击节点下钻 |
| onLinkClick | `(link: SankeyLaidLink) => void` | 点击连线下钻 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderNodeLabel | `(node: SankeyLaidNode) => ReactNode` | 渲染函数：自定义节点标签 |
| renderTooltip | `(item: {type:"node";node} \| {type:"link";link}) => ReactNode` | 渲染函数：自定义 hover tooltip |

## 示例
```tsx
const nodes: SankeyNode[] = [
  { id: "text", label: "文本生成", tone: "var(--color-chart-1)" },
  { id: "router", label: "智能路由器", tone: "var(--color-primary)" },
  { id: "haiku", label: "Haiku 池", tone: "var(--color-chart-4)" },
];
const links: SankeyLink[] = [
  { source: "text", target: "router", value: 42 },
  { source: "router", target: "haiku", value: 38 },
];

<Sankey
  nodes={nodes}
  links={links}
  height={300}
  renderTooltip={(item) =>
    item.type === "node" ? (
      <span>{item.node.label}</span>
    ) : (
      <span>{item.link.source} → {item.link.target}：{item.link.value}</span>
    )
  }
/>
```

## 禁忌 / 坑

- tone 喂给 SVG 的 fill/stroke 必须带 `--color-` 前缀（`var(--color-chart-3)`），裸 `var(--chart-3)`/`var(--primary)` 在 Tailwind v4 下不解析会渲染成黑色/无色，见 [[hulian-token-color-var-needs-color-prefix]]。
- nodes/links 受控：几何由纯函数 `computeSankeyLayout` 算出带坐标的 laid* 形态，`assignLayers` 负责拓扑分层；不要往里传环路 links（拓扑分层假设有向无环）。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
