import type { ReactNode } from "react";

/** 行锚定批注：在匹配 diff 行渲染 gutter 标记 + 行下方插入整宽 content 槽。 */
export interface CodeDiffAnnotation {
  /** 锚定到哪一侧的行号：new=新文件(add/context)，old=旧文件(del/context)。@default "new" */
  side?: "old" | "new";
  /** 行号（1-based，对应 DiffRow.oldNo / newNo）。 */
  line: number;
  /** 行号槽旁的标记（severity 圆点/图标）。 */
  gutter?: ReactNode;
  /** 在该 diff 行下方插入的整宽内容槽（放 CodeReviewThread 等）。 */
  content?: ReactNode;
}

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
  /** 行锚定批注：在匹配行渲染 gutter 标记 + 行下方插入 content 槽（仅 unified 模式插 content）。不传则行为不变。 */
  annotations?: CodeDiffAnnotation[];
  className?: string;
}
