import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

export interface ActionSheetAction {
  key: string;
  label: ReactNode;
  /** 次要说明（小字）。 */
  description?: ReactNode;
  /** 危险动作（红色）。 */
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export type ActionSheetProps = ComponentProps<typeof BaseDialog.Root>;

export interface ActionSheetContentProps {
  /** 顶部标题。 */
  title?: ReactNode;
  /** 标题下说明。 */
  description?: ReactNode;
  actions: ActionSheetAction[];
  /** 取消按钮文案，传 null 隐藏。默认「取消」。 */
  cancelText?: ReactNode | null;
  /** portal 挂载容器。默认 document.body；传某祖先（如手机框）+ 该容器 transform/overflow-hidden，可把遮罩+面板约束在其内（"画框内弹层"）。 */
  container?: HTMLElement | null;
  className?: string;
}
