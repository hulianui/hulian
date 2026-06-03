import type { ReactElement, ReactNode } from "react";

export interface PopconfirmProps {
  /** 标题（确认主问句），串 aria-labelledby。 */
  title: ReactNode;
  /** 描述（次要说明），串 aria-describedby。 */
  description?: ReactNode;
  /**
   * 标题左侧图标。`undefined`=默认警示三角；`null`=不渲染；ReactNode=自定义。
   * 默认图标颜色随 danger 切换（danger→text-danger，否则 text-warning）。
   */
  icon?: ReactNode;
  /** 确认按钮文案，默认「确认」。 */
  okText?: ReactNode;
  /** 取消按钮文案，默认「取消」。 */
  cancelText?: ReactNode;
  /** 危险操作：确认按钮 tone=danger + 默认图标转 text-danger。 */
  danger?: boolean;
  /**
   * 点确认回调。返回 Promise 时确认按钮进入 loading，resolve 后自动关闭；
   * reject 则保持打开并清除 loading（错误反馈由消费者负责，如自行弹 Toast）。
   */
  onConfirm?: () => void | Promise<void>;
  /** 点取消回调（仅显式点取消按钮触发；点外部/Esc 关闭走 onOpenChange 不触发此回调）。 */
  onCancel?: () => void;
  /** 受控打开态。传入即受控，须配合 onOpenChange。 */
  open?: boolean;
  /** 非受控初始打开态，默认 false。 */
  defaultOpen?: boolean;
  /** 打开态变化回调（含点外部/Esc/确认/取消导致的关闭）。 */
  onOpenChange?: (open: boolean) => void;
  /** 浮层相对触发器的方位，默认 top。 */
  side?: "top" | "right" | "bottom" | "left";
  /** 浮层对齐，默认 center。 */
  align?: "start" | "center" | "end";
  /** 浮层与触发器间距，默认 8。 */
  sideOffset?: number;
  /** 禁用：触发器照常渲染但不再唤起确认浮层。 */
  disabled?: boolean;
  /** 触发器（单个元素，确认浮层锚定到它）。 */
  children: ReactElement;
  /** 透传到浮层 Popup 的类名。 */
  className?: string;
}
