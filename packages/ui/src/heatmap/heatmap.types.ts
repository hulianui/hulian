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
  /** 满值（不传取数据最大）。`domain` 同传时以 domain 为准。 */
  max?: number;
  /**
   * 显式值域 [min, max]，按值域比例分档——小数/比率数据（掌握率 0.55~0.88、
   * 百分比 0–1）传 `[0, 1]` 或收紧到实际区间（如 `[0.5, 0.9]`）以铺满色阶。
   * value ≤ min 落 0 档（最浅）。优先级高于 `max`。
   */
  domain?: [number, number];
  /**
   * 数值显示格式化（tooltip 默认文案与色阶图例共用）。
   * 比率转百分比：`(v) => `${Math.round(v * 100)}%``。优先级高于 `unit`。
   */
  valueFormat?: (value: number) => string;
  /** 数值后缀单位（如 `"%"`、`" 次"`），拼在原始值后。要换算请用 valueFormat。 */
  unit?: string;
  /** 显示色阶图例（值域下限 → 色阶块 → 上限，标签走 valueFormat/unit）。@default false */
  showLegend?: boolean;
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
