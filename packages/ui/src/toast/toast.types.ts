import type { ReactNode } from "react";

/** 复用 Alert 语义 tone（无 success：token 无）。 */
export type ToastTone = "info" | "danger" | "neutral";

export interface ToastProviderProps {
  /** 可选应用子树，透传渲染。不传则自闭合挂载，与页面内容并列。 */
  children?: ReactNode;
}

export interface ToastOptions {
  /** 标题（加粗主行）。 */
  title?: ReactNode;
  /** 描述（次行，恒 text-muted）。 */
  description?: ReactNode;
  /** 语调，驱动左边条 + 标题着色。默认 "neutral"。 */
  tone?: ToastTone;
  /** 自动消失毫秒数；0 = 不自动消失。缺省取 Provider 默认（5000）。 */
  timeout?: number;
}
