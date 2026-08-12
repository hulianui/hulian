import type { ReactNode } from "react";

export interface FilterChipProps {
  /** 主语：被筛选的字段名（「状态」「负责人」）。始终渲染在第一段，字重最重。 */
  subject: ReactNode;
  /** 操作符（「属于以下任一项」「等于」）。省略时退化成「主语｜值」两段，不留空栏。 */
  operator?: ReactNode;
  /** 值：收 ReactNode 而非 string —— 真实场景常是头像堆叠 / 状态图标 + 「已选 N 项」。 */
  value: ReactNode;
  size?: "sm" | "md";
  /** 提供则在末尾渲染移除(×)按钮。它是本体的兄弟节点而非后代，故点它不会触发 onClick。 */
  onRemove?: () => void;
  /** 提供则本体（主语/操作符/值三段）变成按钮，用于重新打开对应的筛选菜单。 */
  onClick?: () => void;
  /**
   * 移除按钮无障碍名里用的主语纯文本。
   * subject 是字符串时自动取用；subject 是节点（带图标等）时靠这个字段兜底，
   * 否则一行五个胶囊对读屏就是五个同名的「移除筛选条件」。
   */
  subjectLabel?: string;
  /** 禁用：降透明度、屏蔽指针事件，本体与移除按钮均不可点。 */
  isDisabled?: boolean;
  className?: string;
}

export interface FilterChipGroupProps {
  /** 提供则在行尾渲染「清除全部」文字按钮。 */
  onClearAll?: () => void;
  /** 覆盖「清除全部」按钮文案（默认走 ConfigProvider locale）。 */
  clearAllLabel?: ReactNode;
  /** 覆盖分组的无障碍名（默认走 ConfigProvider locale 的「已应用的筛选条件」）。 */
  "aria-label"?: string;
  className?: string;
  /** FilterChip 列表。一个都没有时整个分组不渲染（含「清除全部」）。 */
  children?: ReactNode;
}
