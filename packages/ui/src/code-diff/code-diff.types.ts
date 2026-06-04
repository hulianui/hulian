export interface CodeDiffProps {
  /** 旧文本。 */
  oldText: string;
  /** 新文本。 */
  newText: string;
  /** 呈现模式：unified 单栏 / split 双栏对照。@default "unified" */
  mode?: "unified" | "split";
  /** 头部文件名条；省略则不渲染头部。 */
  filename?: string;
  /** 显示行号槽。@default true */
  showLineNumbers?: boolean;
  className?: string;
}
