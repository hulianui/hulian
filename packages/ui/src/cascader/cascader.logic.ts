// Cascader 搜索纯逻辑（零 React/DOM）——可独立单测。
import type { TreeNode } from "../tree/tree-core";

export interface CascaderLeafPath {
  /** 从根到叶的 key 路径。 */
  keys: string[];
  /** 从根到叶的 label 文本路径（仅 string label 入索引；非 string 取空串）。 */
  labels: string[];
}

const asText = (label: TreeNode["label"]): string => (typeof label === "string" ? label : "");

// 把树扁平成「叶子路径」（叶 = 无 children）。changeOnSelect 场景也只搜到叶，选中即提交全路径。
export function flattenLeafPaths(
  nodes: TreeNode[],
  prefixKeys: string[] = [],
  prefixLabels: string[] = [],
  out: CascaderLeafPath[] = [],
): CascaderLeafPath[] {
  for (const n of nodes) {
    const keys = [...prefixKeys, n.key];
    const labels = [...prefixLabels, asText(n.label)];
    if (n.children?.length) flattenLeafPaths(n.children, keys, labels, out);
    else out.push({ keys, labels });
  }
  return out;
}

// 模糊匹配：query 命中「整条路径拼接」或「任一层 label」即算命中（大小写不敏感）。空 query 返回空。
export function filterLeafPaths(paths: CascaderLeafPath[], query: string): CascaderLeafPath[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return paths.filter((p) => {
    const joined = p.labels.join(" / ").toLowerCase();
    return joined.includes(q) || p.labels.some((l) => l.toLowerCase().includes(q));
  });
}
