import type { ReactNode } from "react";

export interface ConfirmCardItem {
  label: ReactNode;
  value: ReactNode;
}

export interface ConfirmCardProps {
  /** @default "请确认以下信息" */
  title?: ReactNode;
  items: ConfirmCardItem[];
  /** @default "确认无误" */
  confirmText?: ReactNode;
  /** @default "需要修改" */
  editText?: ReactNode;
  onConfirm?: () => void;
  onEdit?: () => void;
  /** 已操作结果：锁定按钮并标记所选 @default null */
  acted?: "confirmed" | "edited" | null;
  className?: string;
}
