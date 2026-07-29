import type { ReactNode } from "react";

/**
 * 拦截强度。用行为语义而非颜色语义命名 —— 调用方关心的是
 * "这事被挡住了还是只是提个醒"，不是"渲染成红色还是黄色"。
 */
export type InterceptSeverity = "block" | "confirm" | "notice";

export interface InterceptOverride {
  /** 放行理由。审计场景下这是最重要的一条信息。 */
  reason: ReactNode;
  /** 放行时间 / 操作人等附注。 */
  at?: ReactNode;
}

export interface InterceptCardProps {
  severity: InterceptSeverity;
  /** 规则名或事由标题。 */
  title: ReactNode;
  /**
   * 溯源信息（文件路径 · 条款编号 · 策略 ID）。
   * 强烈建议给 —— 一条说不清出处的拦截，用户第一反应是关掉它而不是遵守它。
   */
  source?: ReactNode;
  /** 规则原文或拦截说明。 */
  message: ReactNode;
  /** 具体违反了什么（触发路径、越界值、命中的输入片段）。 */
  violation?: ReactNode;
  /** 建议的合规改法。 */
  suggestion?: ReactNode;
  /**
   * 放行回调。给了才渲染放行入口。
   * 理由是必填的：组件在用户没写理由时不会调用它。
   */
  onOverride?: (reason: string) => void | Promise<void>;
  /** 放行按钮文案。 */
  overrideLabel?: ReactNode;
  /** 理由输入框占位符。 */
  overridePlaceholder?: string;
  /** 已放行时传入，此时不再渲染放行入口，改为展示既有理由。 */
  overridden?: InterceptOverride;
  className?: string;
}
