export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null";

export interface JsonViewerProps {
  /** 任意 JSON 值。 */
  data: unknown;
  /** 根节点标签（如 "response"）。 */
  rootName?: string;
  /** 初始展开深度：嵌套节点 depth < defaultExpandedDepth 时初始展开（根的直接子节点 depth=1）。默认 1。 */
  defaultExpandedDepth?: number;
  /** 大对象/数组懒展开阈值：子项数超过则初始折叠保护。默认 50。 */
  maxAutoExpandKeys?: number;
  /** 复制节点 JSON path 回调（同时复制节点值到剪贴板）。 */
  onCopyPath?: (path: string) => void;
  className?: string;
}
