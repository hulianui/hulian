import type { ReactNode } from "react";

/** 视图模式：月总览 / 周时间轴 / 日时间轴 / 资源（横轴资源·纵轴时间）。 */
export type SchedulerView = "month" | "week" | "day" | "resource";

/** 事件块配色（token 驱动；仅用已定义语义 token，避开未定义色静默回退）。 */
export type SchedulerTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

/** 一个事件（预约/排班）。start/end 为 ISO datetime；受控由消费者持有。 */
export interface SchedulerEvent {
  id: string;
  title: string;
  /** ISO datetime（含时分），按本地时区解释。 */
  start: string;
  /** ISO datetime（含时分）。 */
  end: string;
  /** resource 视图归列；其余视图忽略。 */
  resourceId?: string;
  /** 事件块配色，默认 primary。 */
  tone?: SchedulerTone;
  /** 副标题（如患者/号别），事件块够高时显示。 */
  subtitle?: string;
}

/** resource 视图的一列（医生/诊室）。 */
export interface SchedulerResource {
  id: string;
  title: string;
  subtitle?: string;
}

/** 空白格落点（建预约回吐）。 */
export interface SchedulerSlot {
  start: string;
  end: string;
  resourceId?: string;
}

export interface SchedulerProps {
  /** 受控事件数组。 */
  events: SchedulerEvent[];
  /** 受控视图。 */
  view: SchedulerView;
  /** 受控焦点日（ISO，决定哪周/哪天/哪月）。 */
  date: string;
  /** resource 视图必填。 */
  resources?: SchedulerResource[];
  /** 视图切换（内置 toolbar Segmented）。 */
  onViewChange?: (v: SchedulerView) => void;
  /** 焦点日切换（内置 toolbar 前/今/后、点月视图某天）。 */
  onDateChange?: (iso: string) => void;
  /** 拖移/拖改时长提交：回吐整组新 events（照 Kanban 受控范式）。 */
  onEventsChange?: (events: SchedulerEvent[]) => void;
  /** 空白竖拖创建（拖出一段时间）。 */
  onSlotDragCreate?: (slot: SchedulerSlot) => void;
  /** 点空白格（无拖动）创建。 */
  onSlotClick?: (slot: SchedulerSlot) => void;
  /** 点事件块。 */
  onEventClick?: (event: SchedulerEvent) => void;
  /** 时间轴起始小时，默认 8。 */
  dayStartHour?: number;
  /** 时间轴结束小时，默认 20。 */
  dayEndHour?: number;
  /** 吸附粒度（分钟），默认 30。 */
  slotMinutes?: number;
  /** 每小时像素高（时间轴），默认 56。 */
  hourHeight?: number;
  /** 内置头部工具条（标题 + 前/今/后 + Segmented 视图）。默认 true。 */
  toolbar?: boolean;
  /** 自定义事件块内容（外框/定位/拖拽手柄由组件负责）。 */
  renderEvent?: (event: SchedulerEvent) => ReactNode;
  /** 外层类名（须有确定高度，组件填满时间轴可滚）。 */
  className?: string;
}

/** time-grid 一列的模型（周=7天/日=1天/资源=N资源 统一）。 */
export interface SchedulerColumn {
  /** 列唯一键。 */
  key: string;
  /** 该列对应的日期（ISO YYYY-MM-DD）。 */
  dateISO: string;
  /** 列主标题（周：星期；资源：资源名）。 */
  label: string;
  /** 列副标题（周：日期数字；资源：副标题）。 */
  sublabel?: string;
  /** resource 视图：该列绑定的 resourceId。 */
  resourceId?: string;
  /** 是否今日（高亮）。 */
  isToday?: boolean;
}

/** 重叠并排结果：事件在所在列内的分列序号与总列数。 */
export interface EventLayout {
  col: number;
  cols: number;
}
