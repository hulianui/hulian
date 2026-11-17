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
  /**
   * 长行初始是否自动换行（默认 false = 横向滚动，保留代码的原始排版）。
   * 只是初始值：内容真有一行放不下时，操作区会出现「自动换行」开关供读者自己切。
   * 日志 / 长 URL / 长报错这类「排版不重要、读全才重要」的内容建议传 true。
   */
  defaultWrap?: boolean;
  /**
   * 超过这么多行就折叠，只露出前 maxLines 行 + 渐隐遮罩 + 「展开全部 N 行」按钮（默认不折叠）。
   * 超出不足 3 行时直接全部展示，不为藏一两行加按钮。复制按钮复制的始终是完整代码。
   */
  maxLines?: number;
  className?: string;
}
