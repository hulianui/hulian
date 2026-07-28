export { Tree } from "./tree";
export type { TreeProps, TreeNode, TreeDropEvent, TreeVirtualOptions, DropPosition } from "./tree.types";
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
  nodeSearchText,
  canDropOn,
  isDescendant,
  resolveDropPosition,
  type FlatRow,
  type TreeIndex,
  type CheckState,
} from "./tree-core";
