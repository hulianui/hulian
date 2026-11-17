import type { HTMLAttributes, ReactNode } from "react";

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
  /** 次要行：沉一档底色、文字转次要灰（「也可以这样」的补充命令、给 AI 读的链接）。@default false */
  muted?: boolean;
  className?: string;
}

export interface SnippetGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 绝对定位的装饰层（BorderBeam 等），画在分隔线列表之外，不会被当成一行。 */
  overlay?: ReactNode;
  /** 若干个 `<Snippet>`。 */
  children?: ReactNode;
}
