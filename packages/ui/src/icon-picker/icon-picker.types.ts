import type { ReactNode } from "react";

export interface IconPickerIcon {
  /** 图标名。**它就是对外值**（后端存的一般也是这个名字，而不是 SVG 本身）。 */
  name: string;
  /** 除 `name` 外的搜索别名（如中文名、同义词）。 */
  keywords?: string[];
}

export interface IconPickerSource {
  /** 分类唯一 key。 */
  key: string;
  /** 分类页签上的文字。 */
  label: ReactNode;
  /** 分类页签上的图标（可选，没有就显示 `label` 首字）。 */
  tabIcon?: ReactNode;
  /** 该分类下的全部图标。 */
  icons: IconPickerIcon[];
  /**
   * 把图标名渲染成节点。**图标集不进组件库**，由消费方决定用 lucide、iconfont 还是本地 svg
   * ——瑚琏的 `_icons` 只有运行时必需的那几十个，明确不做图标集。
   */
  renderIcon: (name: string) => ReactNode;
}

export interface IconPickerProps {
  /** 受控值（图标名）。 */
  value?: string | null;
  /** 非受控初始值。 */
  defaultValue?: string | null;
  /** 选中/清空回调；清空回传 `null`。 */
  onValueChange?: (name: string | null) => void;
  /** 图标来源分类（必填）。 */
  sources: IconPickerSource[];
  /** 网格列数。@default 8 */
  columns?: number;
  /** 显示搜索框。@default true */
  searchable?: boolean;
  /** 搜索框占位。@default "搜索图标" */
  searchPlaceholder?: string;
  /** 初始分类 key（省略取第一个）。 */
  defaultSource?: string;
  /** 受控「最近使用」；省略则组件内部维护（最多 16 个，最新在前）。 */
  recent?: string[];
  /** 最近使用变化回调（受控时用它落盘）。 */
  onRecentChange?: (recent: string[]) => void;
  /** 面板顶部显示「清除」按钮（有值时）。@default true */
  clearable?: boolean;
  /** 搜索无结果时的文案。@default "没有匹配的图标" */
  emptyMessage?: ReactNode;
  className?: string;
}
