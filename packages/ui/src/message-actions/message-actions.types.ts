import type { HTMLAttributes, ReactNode } from "react";

export interface MessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** 复制目标文本；提供则显示复制键（点后 Check 反馈 1.5s）。 */
  content?: string;
  /** 复制后回调（与内置剪贴板并行）。 */
  onCopy?: () => void;
  /** 提供则显示重新生成键。 */
  onRegenerate?: () => void;
  /** 提供则显示赞键。 */
  onLike?: () => void;
  /** 提供则显示踩键。 */
  onDislike?: () => void;
  /** 追加自定义操作键。 */
  children?: ReactNode;
}
