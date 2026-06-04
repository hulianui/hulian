import type { ReactNode } from "react";

export type ToolCallStatus = "pending" | "running" | "success" | "error";

export interface ToolCallProps {
  /** 工具名（等宽呈现，如 search_web）。 */
  name: ReactNode;
  /** 调用状态：pending 等待 / running 运行中(转圈) / success 完成 / error 失败。@default "success" */
  status?: ToolCallStatus;
  /** 工具图标槽（默认扳手 Wrench）。 */
  icon?: ReactNode;
  /** 入参（建议传 <CodeBlock/> 或 JSON 文本）。 */
  input?: ReactNode;
  /** 结果（建议传 <CodeBlock/> / <Prose/> 或文本）。 */
  output?: ReactNode;
  /** 非受控初始展开态。 */
  defaultOpen?: boolean;
  /** 受控展开态。 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** 自定义面板内容（替代 input/output）。 */
  children?: ReactNode;
}
