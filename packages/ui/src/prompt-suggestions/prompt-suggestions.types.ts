import type { HTMLAttributes, ReactNode } from "react";

/** 建议项：字符串（label 即 value），或 {label, value} 分离展示与回传值。 */
export type Suggestion = string | { label: ReactNode; value?: string };

export interface PromptSuggestionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "title"> {
  /** 建议列表。 */
  suggestions: Suggestion[];
  /** 点击某项回调（回传其 value）。 */
  onSelect?: (value: string) => void;
  /** 可选标题（列表上方弱化）。 */
  title?: ReactNode;
}
