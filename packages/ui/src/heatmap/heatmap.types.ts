import type { HeatCell } from "./heatmap.matrix";

export interface HeatmapCellInfo {
  x: string | number;
  y: string | number;
  value: number;
}

export interface HeatmapProps {
  /** 稀疏点集。 */
  data: HeatCell[];
  /** 显式列标签（不传从 data 推导）。 */
  xLabels?: (string | number)[];
  /** 显式行标签（不传从 data 推导）。 */
  yLabels?: (string | number)[];
  /** 色阶档数。@default 5 */
  colorScale?: number;
  /** 满值（不传取数据最大）。 */
  max?: number;
  /** 格子边长 px。@default 14 */
  cellSize?: number;
  /** 格间距 px。@default 3 */
  gap?: number;
  /** 是否显示行/列标签。@default true */
  showLabels?: boolean;
  /** 悬停原生提示文案（返回字符串）。 */
  formatTooltip?: (cell: HeatmapCellInfo) => string;
  /** 点击格子下钻。 */
  onCellClick?: (cell: HeatmapCellInfo) => void;
  className?: string;
}
