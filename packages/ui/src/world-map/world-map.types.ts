/** 一个地理坐标点（可带标签，本期不渲染文字）。 */
export interface WorldMapPoint {
  lat: number;
  lng: number;
  label?: string;
}

/** 一条连线对（起点 → 终点）。 */
export interface WorldMapDot {
  start: WorldMapPoint;
  end: WorldMapPoint;
  /** 该条连线（及其两端点）的颜色，不传则用全局 lineColor。同组件内可逐条配色。 */
  color?: string;
}

/** 一个独立节点（不依赖飞线也能画出来：在线 PoP / 机房 / 监测点）。 */
export interface WorldMapNode extends WorldMapPoint {
  /** 业务标识，下钻回调里用来定位。 */
  id?: string;
  /** 驱动节点半径（流量/负载等）。组件内按当前 points 的 value 范围归一化映射到 [rMin, rMax]；不传用基准半径。 */
  value?: number;
  /** 节点颜色（CSS 颜色，默认 chart-1 token）。 */
  color?: string;
}

export interface WorldMapProps {
  /** 要画的连线对（经纬度）。不传 / 空数组则只显示点阵底图。 */
  dots?: WorldMapDot[];
  /** 独立节点（节点分布）。与 dots 互不依赖，可单独使用。 */
  points?: WorldMapNode[];
  /** 是否渲染节点标签文字（默认 false，保持旧行为）。 */
  showLabels?: boolean;
  /** 传入则节点可点击/键盘聚焦下钻；同时 svg 放开 aria-hidden 暴露交互节点。 */
  onPointClick?: (node: WorldMapNode, index: number) => void;
  /** 弧线颜色（CSS 颜色，默认 chart token）。 */
  lineColor?: string;
  /** 点阵颜色（CSS 颜色，默认 border token）。 */
  dotColor?: string;
  /** 单条弧线画入时长(s)。 */
  duration?: number;
  className?: string;
}
