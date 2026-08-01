import type { HTMLAttributes } from "react";
import type { ContributionCell, ContributionDay } from "./contribution-matrix";

/** calendar 周列 × 星期行（GitHub 贡献墙）/ strip 单行最近 N 天（卡片右侧的活动条）。 */
export type ContributionGraphLayout = "calendar" | "strip";

export interface ContributionGraphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "children"> {
  /** 带日期的计数；同日多条累加，`count` 缺省按 1 计。 */
  data: ContributionDay[];
  /** 区间天数（含结束日）。@default 365 */
  days?: number;
  /** 结束日（含），默认今天。 */
  endDate?: string | Date;
  /** 周起始：0=周日（GitHub 口径）/ 1=周一。@default 0 */
  weekStart?: 0 | 1;
  /** @default "calendar" */
  layout?: ContributionGraphLayout;
  /** 色阶档数（不含「无贡献」那档）。@default 4 */
  levels?: number;
  /** 满值（不传取区间内单日最大）。 */
  max?: number;
  /** 色系：语义色名（`success` 走 GitHub 绿）/ 任意 CSS 色。@default "primary" */
  tone?: string;
  /** 格子边长 px。@default 11 */
  cellSize?: number;
  /** 格间距 px。@default 3 */
  gap?: number;
  /** 显示月份标签（仅 calendar）。@default true */
  showMonthLabels?: boolean;
  /** 显示星期标签（仅 calendar，按 GitHub 惯例只标奇数行）。@default false */
  showWeekdayLabels?: boolean;
  /** 显示右下角「少 ▢▢▢▢ 多」色阶图例。@default false */
  showLegend?: boolean;
  /** 月份标签文案。@default (iso) => `${月}月` */
  formatMonth?: (isoDate: string) => string;
  /** 格子原生 hover 提示。@default `2026-08-01 · 3 次贡献` */
  formatTooltip?: (cell: ContributionCell) => string;
  /** 点击某一天下钻（传了之后格子变可聚焦按钮）。 */
  onDayClick?: (cell: ContributionCell) => void;
  className?: string;
}
