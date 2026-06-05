import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";

export type DrawerSide = "left" | "right" | "top" | "bottom";

export type DrawerProps = ComponentProps<typeof BaseDialog.Root>;

export interface DrawerContentProps {
  /** 贴边方向 + 对应的滑入方向，默认 right。 */
  side?: DrawerSide;
  /** 提供则渲 Dialog.Title 作 a11y label。 */
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /**
   * 钉底操作区（放按钮组）。带上分隔线，正文区独立滚动，footer 始终可见。
   * 表单 / 详情类抽屉的「取消 / 保存」「关闭」应放这里而非正文末尾。
   */
  footer?: ReactNode;
  className?: string;
}
