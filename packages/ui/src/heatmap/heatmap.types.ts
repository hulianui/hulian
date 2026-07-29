import type { HeatCell } from "./heatmap.matrix";

export interface HeatmapCellInfo {
  x: string | number;
  y: string | number;
  /** 该格的值；缺席格（`data` 里没有这个点）恒为 `0`，靠 `empty` 区分而不是靠值。 */
  value: number;
  /**
   * 该格在 `data` 里是否缺席（无数据）。组件始终传，可选只为不破坏旧的类型标注。
   * `formatTooltip` 里先判 `empty` 再用 `value`，否则「未上报」会被写成「0」。
   */
  empty?: boolean;
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
  /**
   * 缺席格（`data` 里没有这个点）的背景色，任意 CSS 颜色值（`"var(--color-surface-muted)"`、
   * `"#f0f0f0"`、`"repeating-linear-gradient(...)"` 均可）。
   * 不传时缺席格仍按 0 档色渲染（与真实 0 同色）——贡献活动墙这类「没提交=最浅色」
   * 的既有用法不受影响；只有需要把「无数据」和「值为 0」画成两种颜色时才传
   * （如班级×考点掌握率：未作答 vs 掌握率 0%）。传了之后色阶图例会多一个「无数据」样例块。
   * @default undefined
   */
  emptyCellTone?: string;
  /** 显示色阶图例（值域下限 → 色阶块 → 上限，标签走 valueFormat/unit）。@default false */
  showLegend?: boolean;
  /** 格子边长 px。@default 14 */
  cellSize?: number;
  /** 格间距 px。@default 3 */
  gap?: number;
  /** 是否显示行/列标签。@default true */
  showLabels?: boolean;
  /** 悬停原生提示文案（返回字符串）。缺席格拿到的 `cell.empty === true`、`value` 为 0，别直接印 value。 */
  formatTooltip?: (cell: HeatmapCellInfo) => string;
  /** 点击格子下钻。 */
  onCellClick?: (cell: HeatmapCellInfo) => void;
  className?: string;
}
