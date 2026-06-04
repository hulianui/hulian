import type { ReactNode } from "react";
import type { AgentTask } from "../agent-plan";

export type TaskRunStatus = "idle" | "running" | "success" | "error";

export interface TaskRunnerProps {
  /** 卡头标题（如 "Sandbox"）。 */
  title: ReactNode;
  /** 标题旁标签（如 "node26"），渲染为浅底 Tag。 */
  tag?: ReactNode;
  /** 整体运行状态：驱动头部徽标色 + 进度条 tone。@default "idle" */
  status?: TaskRunStatus;
  /** 头部徽标文字覆盖；省略时按 status 派生（Idle/Running/Done/Failed）。 */
  statusLabel?: ReactNode;
  /** 步骤清单（复用 AgentTask：title/status/detail/meta，耗时放 meta）。 */
  steps: AgentTask[];
  /** 顶部进度 0-100；省略 → 按 steps 完成(done)比自动派生。 */
  progress?: number;
  /** 底部左侧累计耗时（如 "3.12s"）。 */
  elapsed?: ReactNode;
  /** 底部右侧状态文字（如 "Executing..."）。footerExtra 存在时被其替换。 */
  footerStatus?: ReactNode;
  /** 递进送掣：头部右侧追加（按钮/菜单等）。 */
  headerExtra?: ReactNode;
  /** 递进送掣：替换底部右侧内容。 */
  footerExtra?: ReactNode;
  className?: string;
}
