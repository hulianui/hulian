import type { HTMLAttributes, ReactNode } from "react";

/** 标记形状：dot 圆点 / square 方块 / line 短横线（对齐折线图的线样）。 */
export type LegendMarker = "dot" | "square" | "line";

export interface LegendItem {
  label: ReactNode;
  /** 语义色名（`primary`/`success`/`chart-3`…）或任意 CSS 色；缺省按序取 chart-1..6。 */
  color?: string;
  /** 标签后的数值/占比（可选）。 */
  value?: ReactNode;
  /** 该系列已关闭：整条置灰。 */
  hidden?: boolean;
  /** 回调里回传，便于识别是哪条系列。 */
  id?: string | number;
}

export interface LegendProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect" | "children"> {
  items: LegendItem[];
  /** @default "dot" */
  marker?: LegendMarker;
  /** row 横排自动换行 / column 竖排。@default "row" */
  layout?: "row" | "column";
  /** @default "md" */
  size?: "sm" | "md";
  /** 传了则每条可点（切换系列显隐由调用方受控），条目渲染成按钮。 */
  onItemClick?: (item: LegendItem, index: number) => void;
  className?: string;
}
