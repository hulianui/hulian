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

> Sankey diagram · dependency-free SVG ribbons for multilayer flow allocation, topology-derived layers, conserved cross-layer scale, related-path highlighting, tooltips, and drill-down events · data-display/collection

## When to use

Use Sankey to show allocation or conversion across multiple directed layers, such as task routing, budget distribution, or traffic sources. Use Funnel for one linear attrition path, or [Table]/[ProTable] for flat records.

## Import
```ts
import { Sankey, assignLayers, computeSankeyLayout } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| nodes* | `SankeyNode[]` | — | `{id, label?, layer?, tone?}` nodes. Layers are inferred topologically when omitted. |
| links* | `SankeyLink[]` | — | `{source, target, value, tone?}` links whose ribbon width follows value. |
| height | `number` | `320` | Container height. |
| nodeWidth | `number` | `16` | Node rectangle width. |
| nodePadding | `number` | `12` | Vertical spacing between same-layer nodes. |
| linkOpacity | `number` | `0.35` | Ribbon opacity, raised to 0.6 on hover. |
| className | `string` | — | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onNodeClick | `(node: SankeyLaidNode) => void` | Node drill-down. |
| onLinkClick | `(link: SankeyLaidLink) => void` | Link drill-down. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderNodeLabel | `(node: SankeyLaidNode) => ReactNode` | Custom node label. |
| renderTooltip | `(item: {type:"node";node} \| {type:"link";link}) => ReactNode` | Custom node or link hover tooltip. |

## Example
```tsx
const nodes: SankeyNode[] = [
  { id: "text", label: "Text generation", tone: "var(--color-chart-1)" },
  { id: "router", label: "Smart router", tone: "var(--color-primary)" },
  { id: "haiku", label: "Haiku pool", tone: "var(--color-chart-4)" },
];
const links: SankeyLink[] = [
  { source: "text", target: "router", value: 42 },
  { source: "router", target: "haiku", value: 38 },
];

<Sankey
  nodes={nodes}
  links={links}
  height={300}
  renderTooltip={(item) => item.type === "node"
    ? <span>{item.node.label}</span>
    : <span>{item.link.source} → {item.link.target}: {item.link.value}</span>}
/>
```

## Usage notes

- SVG tones require full token names such as `var(--color-chart-3)`; see [[hulian-token-color-var-needs-color-prefix]].
- `computeSankeyLayout` produces laid-out coordinates and `assignLayers` infers topology. Do not pass cyclic links because layering assumes a DAG.
- The root uses built-in Chinese `aria-label` `"\u6851\u57fa\u6d41\u5411\u56fe"`, meaning “Sankey flow diagram.”

## Related

The chart accessibility label follows `ConfigProvider`.
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
