import type { ReactNode } from "react";

/** 命令式对话框语调：派生左侧图标 + 主色。 */
export type ModalType = "confirm" | "info" | "success" | "error" | "warning";

export interface ModalOptions {
  /** 标题（加粗主行）。 */
  title?: ReactNode;
  /** 正文内容。 */
  content?: ReactNode;
  /** 确定按钮文案，默认「确定」。 */
  okText?: ReactNode;
  /** 取消按钮文案，默认「取消」（仅 confirm 渲染取消键）。 */
  cancelText?: ReactNode;
  /**
   * 点确定回调。返回 Promise 时确定键进 loading：
   * resolve → 自动关闭；reject → 保持打开（交由调用方提示错误）。
   */
  onOk?: () => void | Promise<unknown>;
  /** 点取消 / 按 Esc / 点遮罩关闭时回调。 */
  onCancel?: () => void;
  /** 语调；命令式入口已隐含，一般无需显式传。 */
  type?: ModalType;
}

/** 命令式调用返回的实例句柄。 */
export interface ModalInstance {
  /** 立即关闭并销毁该对话框。 */
  destroy: () => void;
  /** 更新已打开对话框的配置（如改标题/内容/按钮文案）。 */
  update: (next: Partial<ModalOptions>) => void;
}
