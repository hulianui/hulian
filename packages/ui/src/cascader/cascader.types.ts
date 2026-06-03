import type { TreeNode } from "../tree/tree-core";

export interface CascaderProps {
  nodes: TreeNode[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], nodes: TreeNode[]) => void;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
