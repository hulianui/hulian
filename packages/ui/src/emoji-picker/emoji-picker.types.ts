export interface EmojiPickerProps {
  /** 选中某个 emoji 的回调。 */
  onSelect?: (emoji: string) => void;
  /** 网格列数。@default 8 */
  columns?: number;
  /** 是否显示搜索框。@default true */
  searchable?: boolean;
  /** 初始分类 key（省略为第一个分类）。 */
  defaultCategory?: string;
  /** 受控「最近使用」列表；省略则组件内部维护。 */
  recent?: string[];
  /** 搜索框 placeholder。 */
  searchPlaceholder?: string;
  className?: string;
}
