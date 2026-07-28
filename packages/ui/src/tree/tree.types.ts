import type { DropPosition, TreeNode } from "./tree-core";

export type { TreeNode, DropPosition };

/** 拖拽落定时回传的指令。数据仍归消费方——组件只说「谁、落到谁的哪一侧」。 */
export interface TreeDropEvent {
  /** 被拖的节点 key */
  dragKey: string;
  /** 落点所在的目标节点 key */
  dropKey: string;
  /** `before`/`after` = 与目标同级排在前/后；`inside` = 成为目标的子节点 */
  position: DropPosition;
}

/** 虚拟滚动配置。传 `true` 用默认值。 */
export interface TreeVirtualOptions {
  /** 滚动容器高度（px）。@default 320 */
  height?: number;
  /** 单行高度（px），须与实际行高一致否则滚动条会飘。@default 36 */
  itemHeight?: number;
  /** 视口外额外渲染的行数。@default 8 */
  overscan?: number;
}

export interface TreeProps {
  nodes: TreeNode[];
  // 展开（受控/非受控对称）
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  // 单选高亮（非 checkable 模式）
  selectable?: boolean; // 默认 true
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (keys: string[], node: TreeNode) => void;
  // 勾选
  checkable?: boolean;
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (info: { checkedKeys: string[]; halfCheckedKeys: string[] }, node: TreeNode) => void;
  /**
   * 什么东西触发展开/收起，默认 `"row"`（点整行）。
   * `"row"` 下有子节点的行点了只会展开，**永远选不中**——需要选中父节点（选目录、选部门、
   * 选任意层级的分类）就改 `"icon"`：只有左侧箭头管展开，行的其余部分照常 select / check。
   * 两种模式下键盘都一样：方向键展开收起、Enter/Space 执行行动作。
   */
  expandTrigger?: "row" | "icon";
  /**
   * 开启拖拽排序（原生 HTML5 拖放，不引 dnd-kit）。
   * `disabled` 的节点既不可拖也不可作为落点。**顺序不归组件**：它只在 `onDrop` 里回传
   * 「谁落到谁的哪一侧」，`nodes` 仍由消费方按自己的后端契约改（家风同 Table 的 `onRowDragEnd`）。
   */
  draggable?: boolean;
  /** 落定回调。不传时 `draggable` 无意义（拖了也没人接）。 */
  onDrop?: (e: TreeDropEvent) => void;
  /**
   * 是否允许「放进目标内部」（改父级）。返回 false 的目标只接受 before/after。
   * 不传则一律允许。典型用法：叶子节点不许再长出子级。
   */
  allowDropInside?: (target: TreeNode) => boolean;
  /**
   * 虚拟滚动。几百上千节点的权限树/组织树用得上。
   * **开启后强制平铺渲染**（无嵌套 DOM、无展开过渡），连接线 `showLine` 同时失效。
   */
  virtual?: boolean | TreeVirtualOptions;
  // 视觉/交互
  showLine?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  "aria-label"?: string;
}
