import type { ReactNode } from "react";

export type LogLevel = "info" | "warn" | "error" | "debug" | "success";

export interface LogLine {
  /** 日志级别，驱动行着色。@default "info" */
  level?: LogLevel;
  /** 日志正文。 */
  message: ReactNode;
  /** 时间戳（如 "12:00:03"）；showTimestamp 为真时渲染在行首。 */
  timestamp?: string;
  /** 来源前缀标记（如 "[build]"），弱化渲染在 message 前。 */
  source?: string;
}

export interface LogViewerProps {
  /** 日志行（数据驱动）。 */
  lines: LogLine[];
  /** 显示每行时间戳。@default false */
  showTimestamp?: boolean;
  /** 新行自动贴底（流式日志刚需）。@default true */
  autoScroll?: boolean;
  /** 长行折行；false 时长行横向滚动。@default false */
  wrap?: boolean;
  /** 滚动区高度。@default 320 */
  height?: number | string;
  className?: string;
}
