import type { ReactNode } from "react";

export type LogLevel = "info" | "warn" | "error" | "debug" | "success" | "command";

export interface LogLine {
  /** 日志级别，驱动行着色；command 用于高亮被执行的命令/提示符行。@default "info" */
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
  /**
   * 新行自动贴底（流式日志刚需）。@default true
   *
   * **黏底语义**：只有当用户本来就停在底部时才跟随新行。一旦向上滚动去看历史，
   * 追加新行不再把视口拽回底部；滚回底部后自动恢复跟随。
   * （早先是每次渲染无条件 `scrollTop = scrollHeight`，长流下根本没法回看。）
   */
  autoScroll?: boolean;
  /**
   * 只保留最后 N 行（0 / 不传 = 不截）。长流日志的护栏：
   * 一条持续跑几小时的构建流会把几万个 DOM 节点堆在页面里，滚动直接卡死。
   * 截断发生在渲染层，`lines` 原数组不动。
   */
  maxLines?: number;
  /** 长行折行；false 时长行横向滚动。@default false */
  wrap?: boolean;
  /** 滚动区高度。@default 320 */
  height?: number | string;
  className?: string;
}
