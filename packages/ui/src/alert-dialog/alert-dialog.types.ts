import type { ReactNode } from "react";

export interface AlertDialogContentProps {
  /** 标题（必填，a11y label）。 */
  title: ReactNode;
  /** 说明文案（可选）。 */
  description?: ReactNode;
  /** 底部操作区：放「取消 / 确认」按钮（取消用 AlertDialogClose）。 */
  children?: ReactNode;
  className?: string;
}
