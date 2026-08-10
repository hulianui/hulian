import type { ReactNode } from "react";

/** 弹出位置（四角）。 */
export type NotificationPlacement = "topRight" | "topLeft" | "bottomRight" | "bottomLeft";

/** 语调：派生左侧色条 + 默认图标。open=中性无图标。token 名同 Alert（info→primary）。 */
export type NotificationType = "open" | "success" | "error" | "info" | "warning";

export interface NotificationOptions {
  /** 标题（加粗主行）。 */
  title?: ReactNode;
  /** 描述（次行，恒 text-muted-foreground）。 */
  description?: ReactNode;
  /** 自定义图标，覆盖按类型派生的默认图标。 */
  icon?: ReactNode;
  /** 自动关闭毫秒数；0 = 不自动关。默认 4500。 */
  duration?: number;
  /** 弹出位置，默认 topRight。 */
  placement?: NotificationPlacement;
  /** 操作区（按钮等），渲染在描述下方。 */
  btn?: ReactNode;
  /** 关闭时回调（自动/手动/编程关闭均触发一次）。 */
  onClose?: () => void;
}

/** 命令式调用返回的实例句柄。 */
export interface NotificationInstance {
  /** 立即关闭该通知。 */
  destroy: () => void;
}
