import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

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
  /**
   * 就地挂载目标（元素或 ref）。提供后抽屉 portal 进该容器并改用 absolute 贴其边，
   * 而非默认 fixed 贴视口——适合手机框预览等需把抽屉收进局部容器的场景。
   * 容器须 position:relative + overflow-hidden。
   */
  /** 是否渲染右上角关闭按钮。@default true */
  showClose?: boolean;
  /** 关闭按钮的无障碍名（默认取 locale 的 drawer.close）。 */
  closeLabel?: string;
  container?: ComponentProps<typeof BaseDialog.Portal>["container"];
  className?: string;
}
