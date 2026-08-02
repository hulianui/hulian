export interface ChartSeries {
  key: string;
  label?: string;
  /**
   * 缺省按序列 index 取 var(--color-chart-N)。可传语义色名（"primary"/"success"/"chart-2" 等，
   * 经 resolveTone 解析为 var(--color-*)）、任意 CSS 颜色或变量覆盖。
   */
  color?: string;
}

export interface ChartProps<TDatum = Record<string, unknown>> {
  data: TDatum[];
  series: ChartSeries[];
  /** 横轴字段名 */
  xKey: string;
  /** 默认 280（SSR 安全：宽走 ResponsiveContainer，高需显式值） */
  height?: number;
  className?: string;
  /** 多序列堆叠（Area/Bar 生效） */
  stacked?: boolean;
  /**
   * 序列图例（色点 + `series.label`）。多序列图不给图例，读者无从知道哪条线是哪条序列。
   * `true` 等价 `"bottom"`。色点走 Dot 的 `color`，与序列色同源。
   * @default false
   */
  legend?: boolean | "top" | "bottom";
}

/** Bar 专属：横向柱状（layout=vertical） */
export interface BarChartProps<TDatum = Record<string, unknown>> extends ChartProps<TDatum> {
  horizontal?: boolean;
  /**
   * horizontal 模式类目轴（Y 轴）宽度 px。默认按最长类目标签自适应
   * （CJK 全角估宽，min 48 / max 160）；标签超长或要精确控制时显式传值覆盖。
   */
  yAxisWidth?: number;
}

/** 饼图/环形图/径向图的扁平数据点 */
export interface ChartDatum {
  name: string;
  value: number;
  /** 缺省按 index 取 var(--color-chart-N) */
  color?: string;
}

export interface PieChartProps {
  data: ChartDatum[];
  /** 环形图（中心挖空） */
  donut?: boolean;
  /** 默认 280 */
  height?: number;
  className?: string;
}

export type RadialChartProps = PieChartProps;
