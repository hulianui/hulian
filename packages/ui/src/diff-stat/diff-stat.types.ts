export type DiffStatStatus = "added" | "modified" | "deleted" | "renamed";

export interface DiffStatProps {
  /** 新增行数。 */
  additions: number;
  /** 删除行数。 */
  deletions: number;
  /** 文件状态徽标（可选）。 */
  status?: DiffStatStatus;
  /** 绿红格子条总格数。@default 5 */
  blocks?: number;
  /** 是否显示 +N −M 数字。@default true */
  showCounts?: boolean;
  /** 尺寸。@default "md" */
  size?: "sm" | "md";
  className?: string;
}
