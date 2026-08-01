import type { ReactNode } from "react";

export interface CommandItemData {
  /** 唯一值（执行回调入参 + React key + 默认过滤兜底文本）。 */
  value: string;
  label: ReactNode;
  /** 参与过滤的关键词（label 非字符串时建议补；与 label/value 合并匹配）。 */
  keywords?: string;
  /** 次级描述（label 下方 muted 小字）。 */
  description?: ReactNode;
  /** 行首图标插槽。 */
  icon?: ReactNode;
  /** 行尾快捷键/标记插槽。 */
  shortcut?: ReactNode;
  disabled?: boolean;
  /** 该项被执行（Enter / 点击）时回调。 */
  onSelect?: (value: string) => void;
}

export interface CommandGroupData {
  /** 分组标题（可选；无则裸列）。 */
  heading?: ReactNode;
  items: CommandItemData[];
}

export interface CommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 命令分组（每组可带 heading）。 */
  groups: CommandGroupData[];
  /** 搜索框占位符。 */
  placeholder?: string;
  /**
   * 自定义过滤：返回 true 保留该项。
   * 默认大小写不敏感子串匹配 `keywords` + 字符串型 `label` + `value`。
   */
  filter?: (item: CommandItemData, query: string) => boolean;
  /** 任意项执行后回调（在 item.onSelect 之后触发，拿到 value）。 */
  onSelectItem?: (value: string) => void;
  /**
   * 搜索词变化回调（含每次打开面板时的清空）。
   * 搜索词是 Command 的内部状态，默认外部读不到；需要**自己排序/分组**（按相关度重排、
   * 按类型分组、命中数写进空态文案、"查看全部结果"链接带上 q=）时，用它把词同步出去，
   * 再配合 `filter={() => true}` 由消费方全权决定 groups —— 这条路径不改变默认行为。
   */
  onQueryChange?: (query: string) => void;
  /** 执行项后是否自动关闭面板。默认 true。 */
  closeOnSelect?: boolean;
  /** 无匹配项时的空态文案。 */
  emptyMessage?: ReactNode;
  /** 内置 ⌘K / Ctrl+K 全局快捷键切换开合。默认 false（消费者亦可用 useCommandShortcut 自绑）。 */
  shortcut?: boolean;
  className?: string;
  "aria-label"?: string;
}
