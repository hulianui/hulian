import type { ReactNode } from "react";

export type AgentTaskStatus = "pending" | "running" | "done" | "error";

export interface AgentTask {
  title: ReactNode;
  /** 任务状态：pending 待办(空心环) / running 进行中(转圈·行高亮) / done 完成(勾·删除线) / error 失败(叉)。@default "pending" */
  status?: AgentTaskStatus;
  /** 次要描述（标题下方弱化）。 */
  detail?: ReactNode;
  /** 行右侧 trailing 槽（右对齐弱化）：放耗时(如 180ms)/小标记。 */
  meta?: ReactNode;
}

export interface AgentPlanProps {
  /** 任务清单（数据驱动）。 */
  tasks: AgentTask[];
  /** 头部标题；传 null 隐藏。@default "执行计划" */
  title?: ReactNode;
  /** 去掉外层边框/底色/内边距，仅渲染列表，供内嵌复用（如 TaskRunner）。@default false */
  bare?: boolean;
  /** done 任务是否加删除线：计划清单语义=true；执行日志语义(如 TaskRunner)=false 保留实色。@default true */
  strikeDone?: boolean;
  className?: string;
}
