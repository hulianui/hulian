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

/**
 * 数据点点击（#275）—— echarts 后台看板的标准钻取交互：点趋势图某天开当日明细、
 * 点饼图某分类带条件跳列表。只透事件不管路由，钻取语义留给业务侧。
 */
export interface ChartPointClickInfo<TDatum> {
  /** 被点中的那一行原始数据（就是 `data[index]`，不是 recharts 的内部形状）。 */
  datum: TDatum;
  /** 该行在 `data` 里的下标。 */
  index: number;
  /**
   * 命中的序列 key。**不保证有值**：笛卡尔图的 tooltip 默认是「整根类目轴共享」的，
   * 点在类目上时 recharts 并不认为某一条序列被单独命中，此时为 `undefined`。
   * 需要区分序列的钻取请自己在 `datum` 上判断。
   */
  seriesKey?: string;
}

/** 扁平数据点（Pie/Radial）的点击信息：那一片就是一个数据点，不存在序列的概念。 */
export interface ChartDatumClickInfo {
  datum: ChartDatum;
  index: number;
}

/**
 * 笛卡尔三件（Area/Bar/Line）与 ComposedChart 共有的能力。
 * 刻意不放进 `ChartProps`：那是 RadarChart 的基类，参考线与直角坐标是绑定的。
 */
export interface CartesianChartProps<TDatum = Record<string, unknown>> extends ChartProps<TDatum> {
  /**
   * 数据点点击回调（对标 echarts 的 `chart.on('click')`）。点在画布空白处或坐标轴上不触发。
   *
   * 命中判据是 recharts 的「当前活跃类目」，与 tooltip 同源 —— 也就是说**只要 tooltip 亮了，
   * 点下去就一定有回调**，不需要精确点中 2px 的折线。
   */
  onPointClick?: (info: ChartPointClickInfo<TDatum>) => void;
  /**
   * 值轴参考线（对标 echarts 的 `markLine`）：帕累托的 80/95 线、均值线、目标线。
   *
   * `y` 是值轴上的位置；双轴图（ComposedChart）用 `axis` 指定挂在哪根轴上，默认 `"left"`。
   * `color` 缺省取 `--color-muted-foreground`，可传语义色名（`"danger"` 等）。
   */
  referenceLines?: ChartReferenceLine[];
  /**
   * 值轴的显示范围 `[min, max]`（#282），`"auto"` 表示该端仍按数据自适应。
   *
   * 典型场景是百分比/占比轴锁 `[0, 100]` 满量程：TOP N 截断的数据往往只到 80 多，
   * auto domain 会让「82%」画到接近顶格、读成「快到 100%」，且越界的 `referenceLines`
   * （如 95 线）会被 recharts 静默丢弃不画。锁定后两个问题一起消失。
   *
   * 数据超出锁定范围时 recharts 会扩轴容纳（不裁剪路径），所以它的语义是「至少覆盖到这里」。
   * `horizontal` 柱图的值轴是横轴，同样由本 prop 管。
   * @example yAxisDomain={[0, 100]}
   */
  yAxisDomain?: ChartAxisDomain;
}

/** 值轴 domain：`[min, max]`，任一端可写 `"auto"` 保持按数据自适应（#282）。 */
export type ChartAxisDomain = [number | "auto", number | "auto"];

export interface ChartReferenceLine {
  /** 值轴上的位置。 */
  y: number;
  /** 线上文案（如「80%」「目标」）。 */
  label?: string;
  /** 挂在哪根值轴上，仅双轴图有意义。@default "left" */
  axis?: "left" | "right";
  /** 线色，缺省 `--color-muted-foreground`；可传语义色名或任意 CSS 颜色。 */
  color?: string;
  /** 虚线段样式，缺省 `"4 4"`；传 `undefined` 之外的空串即实线。 */
  dash?: string;
}

/** Radar 专属 */
export interface RadarChartProps<TDatum = Record<string, unknown>> extends ChartProps<TDatum> {
  /**
   * 半径轴的刻度数字（`0 100 200 …`）。关掉后只剩环线与角轴名，
   * 即 echarts radar 的默认形态（它的 `axisLabel.show` 默认就是 `false`）。
   *
   * 什么时候该关：刻度沿一条水平半径排列，正好穿过数据区，序列一多就压在多边形上；
   * 而雷达图读的是形状对比，精确取值有 tooltip。默认保持 `true` 只是为了不改动存量版式。
   * @default true
   */
  radiusAxis?: boolean;
  /**
   * 每根角轴各自的满量程（#277）—— 键是角轴维度值（即 `data[i][xKey]`），值是该维度的 100% 对应的原始值。
   *
   * 不给它时雷达图是**单一刻度**：销售额（十万级）和退货率（0–100）放同一张图，
   * 量纲大的轴会把其它轴全压成一个点，形状对比就没了。给了之后组件内部把每根轴按各自的
   * 满量程归一，**tooltip 仍显示原始值**（这正是消费方自己在业务侧归一时丢掉的那半截）。
   *
   * 某个维度没在这里给出时，退回「该维度在当前 data 里的最大值」并在开发期告警 ——
   * 混着归一和不归一才是最糟的结果。开启后半径轴刻度默认关闭（0–100 的归一刻度没有意义），
   * 需要的话显式传 `radiusAxis`。
   *
   * @example axisMax={{ 销售额: 500000, 订单数: 800, 退货率: 100 }}
   */
  axisMax?: Record<string, number>;
}

/** ComposedChart 的序列：在 ChartSeries 之上多两维 —— 画成什么、吃哪根值轴。 */
export interface ComposedSeries extends ChartSeries {
  /** 该序列的图种。@default "bar" */
  type?: "bar" | "line" | "area";
  /** 该序列吃哪根值轴。@default "left" */
  axis?: "left" | "right";
}

export interface ComposedChartProps<TDatum = Record<string, unknown>>
  extends Omit<CartesianChartProps<TDatum>, "series" | "yAxisDomain"> {
  series: ComposedSeries[];
  /** 右轴标题（写在轴外侧）。左右轴各画各的量纲时，不标名字读者分不出哪条线读哪根轴。 */
  rightAxisLabel?: string;
  /** 左轴标题，语义同 `rightAxisLabel`。 */
  leftAxisLabel?: string;
  /** 左轴 domain（#282），语义同单轴图的 `yAxisDomain`；与 `leftAxisLabel` 对称。 */
  leftAxisDomain?: ChartAxisDomain;
  /**
   * 右轴 domain（#282）。右轴的第一大用户是百分比轴（帕累托累计占比、退货率、达成率），
   * 锁 `[0, 100]` 满量程后，`referenceLines={[{ y: 95, axis: "right" }]}` 不再因越界被丢弃。
   * @example rightAxisDomain={[0, 100]}
   */
  rightAxisDomain?: ChartAxisDomain;
}

/** Bar 专属：横向柱状（layout=vertical） */
export interface BarChartProps<TDatum = Record<string, unknown>> extends CartesianChartProps<TDatum> {
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
  /**
   * 点中某一片时回调（#275）：点分类饼图某片带条件跳列表这类钻取。
   * 只在扇区上触发，点在留白处不触发。
   */
  onPointClick?: (info: ChartDatumClickInfo) => void;
}

export type RadialChartProps = PieChartProps;
