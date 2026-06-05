import type { HTMLAttributes } from "react";

/** 时间轴刻度单位：day=逐日 / week=按周（周一起）/ month=按月。仅影响表头刻度密度，不改条形定位。 */
export type GanttUnit = "day" | "week" | "month";

/** 单条任务（工序）。start/end 为 "YYYY-MM-DD"（含首尾两端，闭区间）。 */
export interface GanttTask {
  /** 唯一标识 */
  id: string;
  /** 任务/工序名（左列显示） */
  name: string;
  /** 起始日期 "YYYY-MM-DD"（含当天） */
  start: string;
  /** 结束日期 "YYYY-MM-DD"（含当天） */
  end: string;
  /** 完成进度 0-100，省略视为 0；驱动条内深色填充层 */
  progress?: number;
  /** 分组名：相同 group 的任务在左列以小标题聚拢（省略则不分组） */
  group?: string;
  /** 自定义条形主色（CSS 颜色，如 token var() 或 hex）；省略走主题 primary */
  color?: string;
}

export interface GanttProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 任务列表（只读渲染，不可拖拽改期） */
  tasks: GanttTask[];
  /** 时间轴起点 "YYYY-MM-DD"；省略自动取 tasks 最早 start 并向前留少量 padding */
  rangeStart?: string;
  /** 时间轴终点 "YYYY-MM-DD"；省略自动取 tasks 最晚 end 并向后留少量 padding */
  rangeEnd?: string;
  /** 表头刻度单位，默认 "day" */
  unit?: GanttUnit;
  /** 今日竖线日期 "YYYY-MM-DD"；落在范围内才绘制（省略不画） */
  today?: string;
  /** 每行高度（px），默认 36 */
  rowHeight?: number;
  className?: string;
}
