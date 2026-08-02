import type { ReactNode } from "react";

export interface SnippetProps {
  /** 显示内容（字符串或节点）。 */
  children?: ReactNode;
  /** 复制到剪贴板的文本；缺省时取 children（仅当为字符串时）。 */
  text?: string;
  /** 命令提示符（默认 "$"；传 null 不显示，适合代码片段）。 */
  symbol?: string | null;
  /** 语法着色用的语言（如 "tsx"/"bash"）。仅当 children 为字符串时生效。 */
  lang?: string;
  /** 是否语法着色（默认 true，仅 children 为字符串时生效）。命令多为纯色，JS 片段会着色。 */
  highlight?: boolean;
  /** Accessible label for the copy action. */
  copyLabel?: string;
  /** Accessible label shown after copying. */
  copiedLabel?: string;
  className?: string;
}
