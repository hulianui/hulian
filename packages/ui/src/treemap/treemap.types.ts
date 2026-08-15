export interface TreemapDatum {
  name: string;
  value: number;
  /** 缺省按 index 取 `var(--color-chart-N)`；可传语义色名或任意 CSS 颜色。 */
  color?: string;
}

export interface TreemapItemClickInfo {
  datum: TreemapDatum;
  index: number;
}

export interface TreemapProps {
  /** 扁平数据（单层）。面积按 `value` 占总量的比例分配。 */
  data: TreemapDatum[];
  /** 组件总高，默认 280。宽走 ResponsiveContainer（SSR 安全：高需显式值）。 */
  height?: number;
  className?: string;
  /**
   * 点中某一格时回调（钻取用：点门店进该店会员列表）。
   * 只在格子上触发，点在留白处不触发。
   */
  onItemClick?: (info: TreemapItemClickInfo) => void;
  /**
   * 格子里是否显示数值（名字下面一行）。
   * @default false
   */
  showValue?: boolean;
  /** 数值显示格式，缺省 `String(value)`。同时作用于格内文字与 tooltip。 */
  valueFormat?: (value: number) => string;
}
