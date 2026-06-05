import type { ReactNode } from "react";

// 桑基图（Sankey）类型 —— 库内首个多层流向 / 分配比例图。
//   · 输入 nodes/links 受控；几何由纯函数 computeSankeyLayout 算成带坐标的 laid* 形态。
//   · 不给 layer 则按 links 拓扑分层（source 层 < target 层）；流宽按 value 占比。

export interface SankeyNode {
  id: string;
  label?: ReactNode;
  /** 不给则按 links 拓扑推导。 */
  layer?: number;
  /** CSS 颜色或 token 变量（如 "var(--color-chart-3)"）；默认走主题。 */
  tone?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  tone?: string;
}

export interface SankeyLayoutOptions {
  width: number;
  height: number;
  /** 节点矩形宽，默认 16。 */
  nodeWidth: number;
  /** 同层节点间垂直间隔，默认 12。 */
  nodePadding: number;
}

export interface SankeyLaidNode extends SankeyNode {
  layer: number;
  /** 节点矩形左上 x。 */
  x: number;
  /** 节点矩形左上 y。 */
  y: number;
  /** 按流量算出的矩形高。 */
  height: number;
}

export interface SankeyLaidLink extends SankeyLink {
  /** SVG ribbon 描边 path（d 属性）。 */
  path: string;
  /** 笔宽 = value 占比，直接用作 stroke-width。 */
  width: number;
  /** 源端纵坐标中点。 */
  sy: number;
  /** 目标端纵坐标中点。 */
  ty: number;
}

export interface SankeyLayout {
  nodes: SankeyLaidNode[];
  links: SankeyLaidLink[];
  layers: number;
}

export interface SankeyProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  /** 容器高，默认 320。 */
  height?: number;
  /** 节点矩形宽，默认 16。 */
  nodeWidth?: number;
  /** 同层节点间垂直间隔，默认 12。 */
  nodePadding?: number;
  /** ribbon 描边透明度，默认 0.35（hover 提至 0.6）。 */
  linkOpacity?: number;
  renderNodeLabel?: (node: SankeyLaidNode) => ReactNode;
  renderTooltip?: (
    item:
      | { type: "node"; node: SankeyLaidNode }
      | { type: "link"; link: SankeyLaidLink },
  ) => ReactNode;
  onNodeClick?: (node: SankeyLaidNode) => void;
  onLinkClick?: (link: SankeyLaidLink) => void;
  className?: string;
}
