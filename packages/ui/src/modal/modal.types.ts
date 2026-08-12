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
  /**
   * 危险操作：确定键走 `tone="danger"`，左侧图标同步转 `text-danger`。
   * 与 [Popconfirm](../popconfirm/popconfirm.md) 的 `danger` 同名同义。
   *
   * **`type` 管不了确定键**：`type="error"` 只换图标与图标色，确定键仍是默认的主色档，
   * 于是「删除后不可恢复」的确定键和「保存」长得一模一样。要让按钮变红只有这一个开关。
   *
   * 图标**字形**仍由 `type` 决定（`modal.confirm` 依旧是问号），只有颜色跟着 `danger` 走：
   * 字形说的是「这是一个提问」，颜色说的是「后果不可逆」，两件事不冲突。
   */
  danger?: boolean;
}

/** 命令式调用返回的实例句柄。 */
export interface ModalInstance {
  /** 立即关闭并销毁该对话框。 */
  destroy: () => void;
  /** 更新已打开对话框的配置（如改标题/内容/按钮文案）。 */
  update: (next: Partial<ModalOptions>) => void;
}
