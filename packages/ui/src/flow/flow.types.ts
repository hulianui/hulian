import type { MutableRefObject, ReactNode } from "react";

/** 画布坐标点（世界坐标，未经 viewport 变换）。 */
export interface FlowPoint {
  x: number;
  y: number;
}

/** 视口变换：平移 (x,y) 像素 + 缩放 zoom。世界点 → 屏幕点 = world*zoom + (x,y)。 */
export interface FlowViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface FlowSize {
  width: number;
  height: number;
}

/** 一个节点。data 由消费者自定义；position 为画布坐标。 */
export interface FlowNode<T = unknown> {
  id: string;
  position: FlowPoint;
  data: T;
  /** 覆盖默认节点宽度。高度由内容自适应（组件测量）。 */
  width?: number;
}

/** 一条连线。source/target 为节点 id；handle 为该节点上的桩 id。 */
export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

/** 连接桩声明：左侧 target（入），右侧 source（出）。 */
export interface FlowHandleSpec {
  id: string;
  type: "source" | "target";
  /** 无障碍标签 / 悬停提示。 */
  label?: string;
}

/** onConnect 回吐的连接（无 id，消费者补 id 并去重）。 */
export interface FlowConnection {
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

/** renderNode 拿到的渲染态。 */
export interface FlowNodeRenderState {
  selected: boolean;
}

export interface FlowProps<T = unknown> {
  /** 受控节点数组。 */
  nodes: FlowNode<T>[];
  /** 受控连线数组。 */
  edges: FlowEdge[];
  /** 声明每个节点的连接桩（左 target / 右 source，按返回顺序在该侧均分纵向位置）。 */
  getHandles: (node: FlowNode<T>) => FlowHandleSpec[];
  /** 渲染节点内容（外框/桩/选中态由组件负责）。 */
  renderNode: (node: FlowNode<T>, state: FlowNodeRenderState) => ReactNode;
  /** 节点被拖动后回吐整组新位置（组件不直接改 data，照 Kanban 受控范式）。 */
  onNodesChange?: (nodes: FlowNode<T>[]) => void;
  /** 从输出桩拖到合法输入桩成功 → 新连接。 */
  onConnect?: (connection: FlowConnection) => void;
  /** 删除连线（选中连线后点 × 或按 Delete）。 */
  onEdgesDelete?: (ids: string[]) => void;
  /** 删除节点（选中节点点 × 或按 Delete）。 */
  onNodeDelete?: (id: string) => void;
  /** 单选受控：当前选中节点 id。 */
  selectedId?: string | null;
  /** 选中变化（点节点 = id，点空白 = null）。 */
  onSelectNode?: (id: string | null) => void;
  /** 默认节点宽度（px，画布坐标）。默认 240。 */
  defaultNodeWidth?: number;
  /** 缩放下限 / 上限。默认 0.35 / 2。 */
  minZoom?: number;
  maxZoom?: number;
  /** 是否显示右下角缩放/适配工具条。默认 true。 */
  controls?: boolean;
  /** 画布底纹（false 关闭；默认内置点阵）。 */
  background?: ReactNode | false;
  /** 某条连线是否走流光动画（如运行中的链路）。 */
  isEdgeAnimated?: (edge: FlowEdge) => boolean;
  /** 画布外层类名（须有确定高度，组件填满）。 */
  className?: string;
  /** 触达画布命令式句柄（fitView / zoomIn / zoomOut / reset）。 */
  apiRef?: MutableRefObject<FlowApi | null>;
}

/** 命令式画布句柄。 */
export interface FlowApi {
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  /** 智能排版：按连线拓扑分层重排节点并适配视图（回吐 onNodesChange）。 */
  autoLayout: () => void;
}
