export interface CodeBlockProps {
  /** 代码文本（多行用 \n）。 */
  code: string;
  /** 右上角语言标签（可选，如 "tsx"）。 */
  lang?: string;
  /** 是否显示复制按钮（默认 true）。 */
  copyable?: boolean;
  className?: string;
}
