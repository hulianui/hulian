import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";

export type ListSize = "sm" | "md" | "lg";

/** 栅格卡片态配置（复用 Grid 原语）。传 true 用默认 3 列。 */
export interface ListGridConfig {
  /** 列数。@default 3 */
  cols?: number;
  /** 行列间距（× 0.25rem）。@default 4 */
  gap?: number;
  /** 列间距覆盖 gap。 */
  colGap?: number;
  /** 行间距覆盖 gap。 */
  rowGap?: number;
  /** 行数。 */
  rows?: number;
}

export interface ListLoadMore {
  /** 点击「加载更多」回调。 */
  onLoadMore: () => void;
  /** 加载中（按钮转圈 + 禁用）。 */
  loading?: boolean;
  /** 是否还有更多；为 false 时不渲染按钮。@default true */
  hasMore?: boolean;
  /** 按钮文案。@default "加载更多" */
  text?: ReactNode;
}

export interface ListProps<T = unknown> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 数据数组（数据驱动模式，配合 renderItem）。 */
  items?: T[];
  /** 渲染每一项；建议返回 <ListItem>。不传则把 item 当 ReactNode 直接渲染。 */
  renderItem?: (item: T, index: number) => ReactNode;
  /** 组合模式：直接放 <ListItem> 子元素（与 items 二选一，items 优先）。 */
  children?: ReactNode;
  /** 尺寸（影响行内边距）。@default "md" */
  size?: ListSize;
  /** 外层边框 + 圆角容器（栅格态下忽略，由卡片自带边框）。@default false */
  bordered?: boolean;
  /**
   * 行 / 头尾插槽的水平内边距（与 bordered 解耦）。
   * 无框 List 放进侧栏、面板等已有容器时设 `inset` 让内容不贴边；
   * 反之放进自带内边距的 CardBody 时保持默认 flush 即可。
   * 不传时回退到 bordered 的值（有框必内缩，无框默认贴边）。
   */
  inset?: boolean;
  /** 行分隔线（栅格态下忽略）。@default true */
  split?: boolean;
  /** 栅格卡片态（复用 Grid）；传 true 用默认配置。 */
  grid?: boolean | ListGridConfig;
  /** 头部插槽。 */
  header?: ReactNode;
  /** 底部插槽（渲染在最底部）。 */
  footer?: ReactNode;
  /** 空态内容；不传用内置 <Empty>。 */
  empty?: ReactNode;
  /** 「加载更多」配置（底部按钮 + loading）。 */
  loadMore?: ListLoadMore;
  /** 分页槽（放 <Pagination>），渲染在列表下方。 */
  pagination?: ReactNode;
}

export interface ListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** 行右侧操作区（按钮组），多个项之间自动加分隔线。 */
  actions?: ReactNode[];
  /** 主内容（或用 <ListItem.Meta>）。 */
  children?: ReactNode;
}

export interface ListItemMetaProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 头像 / 图标（dogfood 复用 Avatar）。 */
  avatar?: ReactNode;
  /** 标题。 */
  title?: ReactNode;
  /** 描述。 */
  description?: ReactNode;
}
