import type { ReactNode } from "react";
import type { ReviewSeverity } from "./code-review-thread.severity";

export interface ReviewComment {
  id: string;
  author: { name: string; avatar?: string; kind: "ai" | "human" };
  severity?: ReviewSeverity;
  body: ReactNode;
  time?: ReactNode;
  /** 建议修改：渲染内嵌建议 diff + 「采纳」按钮。 */
  suggestion?: { oldText?: string; newText: string };
}

export type ReviewThreadStatus = "open" | "resolved" | "wontfix";

export interface CodeReviewThreadProps {
  comments: ReviewComment[];
  /** 线程状态（受控；不传则内部自管，默认 open）。 */
  status?: ReviewThreadStatus;
  onStatusChange?: (s: ReviewThreadStatus) => void;
  onReply?: (text: string) => void;
  onAdoptSuggestion?: (commentId: string) => void;
  /** 是否显示回复框。@default true */
  replyable?: boolean;
  /** 非受控初始折叠态。 */
  defaultCollapsed?: boolean;
  /** 受控折叠（优先于 defaultCollapsed）。 */
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  className?: string;
}
