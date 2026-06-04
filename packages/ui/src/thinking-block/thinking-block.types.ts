import type { ReactNode } from "react";

export interface ThinkingBlockProps {
  /** 头部标题。@default "思考过程" */
  title?: ReactNode;
  /** 进行态：标题转圈 + 高光流动，且默认展开（agent 正在推理）。 */
  thinking?: boolean;
  /** 耗时标记（标题右侧弱化，如「思考 3s」）。 */
  duration?: ReactNode;
  /** 非受控初始展开态（默认随 thinking）。 */
  defaultOpen?: boolean;
  /** 受控展开态。 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** 推理正文（markdown 建议外包 <Prose/>）。 */
  children?: ReactNode;
}
