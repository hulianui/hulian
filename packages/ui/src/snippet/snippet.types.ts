import type { ReactNode } from "react";

export interface SnippetProps {
  /** 显示内容（字符串或节点）。 */
  children?: ReactNode;
  /** 复制到剪贴板的文本；缺省时取 children（仅当为字符串时）。 */
  text?: string;
  /** 命令提示符（默认 "$"；传 null 不显示，适合代码片段）。 */
  symbol?: string | null;
  className?: string;
}
