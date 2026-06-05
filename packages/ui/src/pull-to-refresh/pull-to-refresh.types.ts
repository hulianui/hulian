import type { ReactNode } from "react";

export interface PullToRefreshProps {
  /** 触发刷新回调；返回 Promise 期间保持「刷新中」，结束后回弹。 */
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  /** 触发刷新的下拉阈值 px，默认 64。 */
  threshold?: number;
  /** 下拉阻尼系数(0-1，越小越「沉」)，默认 0.5。 */
  resistance?: number;
  pullingText?: ReactNode;
  /** 越过阈值待释放时的文案。 */
  armedText?: ReactNode;
  refreshingText?: ReactNode;
  className?: string;
}
