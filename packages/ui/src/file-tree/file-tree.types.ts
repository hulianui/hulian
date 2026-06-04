export type FileStatus = "added" | "modified" | "deleted" | "untracked" | "renamed";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  /** 改动状态，渲染为右侧字母角标。 */
  status?: FileStatus;
  /** 子节点（仅 folder 有意义）。 */
  children?: FileNode[];
  /** 文件夹初始展开。@default false */
  defaultExpanded?: boolean;
}

export interface FileTreeProps {
  nodes: FileNode[];
  /** 受控高亮当前选中（按拼接 path 匹配）。 */
  selectedPath?: string;
  /** 点击文件/文件夹回调，回传节点与拼接 path。 */
  onSelect?: (node: FileNode, path: string) => void;
  className?: string;
}
