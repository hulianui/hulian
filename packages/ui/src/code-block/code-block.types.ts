export interface CodeBlockProps {
  /** 代码文本（多行用 \n）。 */
  code: string;
  /** 右上角语言标签（可选，如 "tsx"）。 */
  lang?: string;
  /** 是否显示复制按钮（默认 true）。 */
  copyable?: boolean;
  /** 是否语法着色（默认 true）。按 lang 走 JS 家族或 Shell 规则，关掉则纯文本。 */
  highlight?: boolean;
  className?: string;
}
