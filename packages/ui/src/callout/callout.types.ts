import type { ReactNode } from "react";

export type CalloutTone = "tip" | "info" | "warning" | "success" | "danger";

export interface CalloutProps {
  /** 语气：tip/info 主色、warning 警告、success 正解、danger 坑/危险。默认 tip。 */
  tone?: CalloutTone;
  /** 图标 slot（emoji 或 SVG；设计系统不绑图标库）。 */
  icon?: ReactNode;
  /** 标题（tone 色强调）；children 为正文（foreground 可读）。 */
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}
