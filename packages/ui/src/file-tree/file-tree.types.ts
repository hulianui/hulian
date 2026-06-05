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
  /** 行右键回调（消费者配 ContextMenu 锚光标弹菜单）。 */
  onContextMenu?: (node: FileNode, path: string, e: React.MouseEvent) => void;
  /** 受控展开的 folder path 集合（传入即受控）。 */
  expandedPaths?: string[];
  /** 非受控初始展开（与各 folder 的 defaultExpanded 合并）。 */
  defaultExpandedPaths?: string[];
  /** 展开变化回调（受控/非受控都回调）。 */
  onExpandedChange?: (paths: string[]) => void;
  /** 树内搜索框（过滤 + 命中祖先自动展开）。@default false */
  searchable?: boolean;
  /** 搜索框占位符。@default "搜索文件" */
  searchPlaceholder?: string;
  className?: string;
}
