// RegionCascader 纯逻辑（零 React）——可独立单测。
import type { TreeNode } from "../tree/tree-core";

// 按层级裁剪行政区划树：level=2 砍掉第三层（区县），只留省/市；level>=3 原样返回。
export function sliceLevel(nodes: TreeNode[], level: 2 | 3): TreeNode[] {
  if (level >= 3) return nodes;
  return nodes.map((province) => ({
    ...province,
    children: province.children?.map((city) => ({ key: city.key, label: city.label })),
  }));
}
