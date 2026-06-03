import type { TreeNode } from "../tree/tree-core";

export interface TreeSelectProps {
  nodes: TreeNode[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  showLine?: boolean;
  className?: string;
}
