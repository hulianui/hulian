import type { HTMLAttributes, ReactNode } from "react";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** 环比百分比，>=0 升(text-primary) / <0 降(text-danger)；不传则不渲染趋势 */
  delta?: number;
  deltaLabel?: ReactNode;
  icon?: ReactNode;
  /** 可选图表插槽（如 KPI 趋势 sparkline），渲染在数值行下方、delta 上方。 */
  chart?: ReactNode;
}
