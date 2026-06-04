import type { ReactNode } from "react";

export type AgentTaskStatus = "pending" | "running" | "done" | "error";

export interface AgentTask {
  title: ReactNode;
  /** 任务状态：pending 待办(点) / running 进行中(转圈) / done 完成(勾·删除线) / error 失败(叉)。@default "pending" */
  status?: AgentTaskStatus;
  /** 次要描述（标题下方弱化）。 */
  detail?: ReactNode;
}

export interface AgentPlanProps {
  /** 任务清单（数据驱动）。 */
  tasks: AgentTask[];
  /** 头部标题；传 null 隐藏。@default "执行计划" */
  title?: ReactNode;
  className?: string;
}
