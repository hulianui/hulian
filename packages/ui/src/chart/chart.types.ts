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
}
