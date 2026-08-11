export interface CodeBlockProps {
  /** 代码文本（多行用 \n）。 */
  code: string;
  /** 右上角语言标签（可选，如 "tsx"）。 */
  lang?: string;
  /** 是否显示复制按钮（默认 true）。 */
  copyable?: boolean;
  /** 是否语法着色（默认 true）。按 lang 走 JS 家族、Shell 或 Python 规则，关掉则纯文本。 */
  highlight?: boolean;
  /**
   * 是否显示行号（默认 false，不显示时 DOM 与旧版一字不差）。
   * 传 `{ start: 120 }` 让片段从指定行号起算（如正文只截取源码的一段）。
   * 行号是 `aria-hidden` + 不可选中的装饰：不进屏幕阅读器，框选复制也不会被带走，
   * 复制按钮复制的始终是原始 `code`。
   */
  lineNumbers?: boolean | { start?: number };
  className?: string;
}
