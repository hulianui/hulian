export interface ChartSeries {
  key: string;
  label?: string;
  /** 缺省按序列 index 取 var(--color-chart-N)；可传任意 CSS 颜色/变量覆盖 */
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
}

/** Bar 专属：横向柱状（layout=vertical） */
export interface BarChartProps<TDatum = Record<string, unknown>> extends ChartProps<TDatum> {
  horizontal?: boolean;
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
