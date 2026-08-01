import type { HTMLAttributes, MouseEvent, ReactNode } from "react";

export interface AppLauncherItem {
  id: string | number;
  /** 应用名（超出按 labelLines 截断）。 */
  label: ReactNode;
  /** 图标槽：`<img>` / svg / emoji / 任意节点，会被裁进圆角方框。 */
  icon: ReactNode;
  /** 所属分类 key，配 `categories` 过滤。 */
  category?: string;
  /** 分节 key：**连续**同节的项归一组，组间画分隔线（如「最近使用」在最前）。 */
  section?: string;
  /** 点击跳转（渲染为 `<a>`）。 */
  href?: string;
  target?: string;
  disabled?: boolean;
  /** 图标右上角标（未读数 / 新版本点）。 */
  badge?: ReactNode;
  /** 搜索别名：拼音、英文名、缩写——label 非字符串时**只**靠它命中。 */
  keywords?: string[];
}

export interface AppLauncherCategory {
  key: string;
  label: ReactNode;
}

/** groupSections 的产物：连续同 section 的一组。 */
export interface AppLauncherSection {
  key: string;
  items: AppLauncherItem[];
}

export interface AppLauncherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "title" | "children"> {
  items: AppLauncherItem[];
  /** 分类胶囊；不传则不渲染这一行。 */
  categories?: AppLauncherCategory[];
  /** 受控当前分类（`undefined` = 全部）。 */
  category?: string;
  /** 非受控初始分类。 */
  defaultCategory?: string;
  onCategoryChange?: (key: string | undefined) => void;
  /** 「全部」胶囊文案。@default "全部" */
  allLabel?: ReactNode;
  /** 左上标题；`searchable` 时它同时是搜索框的 placeholder（对齐 macOS 启动台）。 */
  title?: ReactNode;
  /** 标题左侧的 logo 槽。 */
  logo?: ReactNode;
  /** 右上操作槽（更多菜单 / 设置）。 */
  actions?: ReactNode;
  /** @default true */
  searchable?: boolean;
  /** 受控搜索词。 */
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  /** 列数。@default 7 */
  columns?: number;
  /** 图标边长 px。@default 64 */
  iconSize?: number;
  /** 应用名最多几行（超出省略号）。@default 1 */
  labelLines?: 1 | 2;
  /** glass 毛玻璃（需身后有底图）/ solid 实底。@default "glass" */
  variant?: "glass" | "solid";
  /** 空结果文案。@default "没有匹配的应用" */
  emptyText?: ReactNode;
  onItemClick?: (item: AppLauncherItem, event: MouseEvent<HTMLElement>) => void;
  onItemContextMenu?: (item: AppLauncherItem, event: MouseEvent<HTMLElement>) => void;
  className?: string;
}
