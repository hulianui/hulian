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
   *
   * **默认值按图种分两档**：笛卡尔三件（Area/Bar/Line）默认 `false`；
   * 极坐标三件（Radar/Pie/Radial）默认 `true`（它们历来自带图例，保持零改动不 breaking）。
   * @default false
   */
  legend?: boolean | "top" | "bottom";
  /**
   * 图例恒为单行 + 横向滚动（对齐 echarts 的 `legend.type: "scroll"`）。
   * 缺省是换行居中：序列一多就堆成多行，把画布挤扁（`height` 是组件总高，图例吃掉的
   * 就是画布的）。序列 >8 条基本都该开这个，否则每个消费方都得自绘一遍横向图例。
   * @default false
   */
  legendScroll?: boolean;
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
  /**
   * 图例（色点 + `data[].name`），语义同 `ChartProps.legend`，但**默认 `true`** ——
   * 饼/环/径向历来自带图例，保持既有调用零改动。传 `false` 关掉（自绘图例时必须关，
   * 否则两份图例并排）。
   * @default true
   */
  legend?: boolean | "top" | "bottom";
  /** 图例恒为单行 + 横向滚动，语义同 `ChartProps.legendScroll`。 @default false */
  legendScroll?: boolean;
}

export type RadialChartProps = PieChartProps;
