export { Tree } from "./tree";
export type { TreeProps, TreeNode } from "./tree.types";
// Layer A 核：供 tree-select / cascader 复用，并对外暴露工具
export {
  buildIndex,
  flattenVisible,
  getNodePath,
  toggleChecked,
  getCheckState,
  normalizeCheckedToLeaves,
  computeChecked,
  filterTree,
  type FlatRow,
  type TreeIndex,
  type CheckState,
} from "./tree-core";
