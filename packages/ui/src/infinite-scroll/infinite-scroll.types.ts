import type { ReactNode } from "react";

export interface InfiniteScrollProps {
  /** 触底加载回调；返回 Promise 期间不重复触发。 */
  onLoadMore: () => Promise<void> | void;
  /** 是否还有更多；false 时停止观察并显示完结文案。 */
  hasMore: boolean;
  children: ReactNode;
  /** 距底多少 px 提前触发（IntersectionObserver rootMargin），默认 100。 */
  threshold?: number;
  loadingText?: ReactNode;
  finishedText?: ReactNode;
  className?: string;
}
