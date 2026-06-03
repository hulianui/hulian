import type { ReactNode } from "react";

/** 单步状态。缺省时由 current 派生：index<current=finish / ==current=Steps.status / >current=wait。 */
export type StepStatus = "wait" | "process" | "finish" | "error";

export interface StepsItem {
  /** 步骤标题。 */
  title: ReactNode;
  /** 步骤描述（标题下方次要文案）。 */
  description?: ReactNode;
  /** 自定义指示器内容（覆盖默认序号/状态图标）。 */
  icon?: ReactNode;
  /** 显式状态，覆盖由 current 派生的状态。 */
  status?: StepStatus;
  /** 禁用：不可点击、降透明度。 */
  disabled?: boolean;
}

export interface StepsProps {
  items: StepsItem[];
  /** 当前步骤索引（从 0 起）。 */
  current?: number;
  /** 当前步骤的状态（仅作用于 index===current 的那一步），默认 process。 */
  status?: Exclude<StepStatus, "wait">;
  direction?: "horizontal" | "vertical";
  size?: "sm" | "md";
  /** 提供则每步可点击，点击非禁用步触发（index）。 */
  onChange?: (index: number) => void;
  className?: string;
}
