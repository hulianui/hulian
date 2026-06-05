import type { ReactNode } from "react";

export interface DialogContentProps {
  title: string;
  description?: string;
  children?: ReactNode;
  /** 底部操作区（如取消/确定按钮）。渲染在正文下方，顶部分隔线 + 右对齐，与 DrawerContent 对齐。 */
  footer?: ReactNode;
  className?: string;
}
