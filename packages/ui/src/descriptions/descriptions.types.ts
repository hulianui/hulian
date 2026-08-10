import type { HTMLAttributes, ReactNode } from "react";

/** 描述项数据（items 数组 prop 形态，等价于 DescriptionsItem 子节点的 props） */
export interface DescriptionsItemData {
  /** 键名（label=text-muted-foreground） */
  label?: ReactNode;
  /** 值内容（value=text-foreground） */
  children?: ReactNode;
  /** 跨列数，默认 1；超过 column 时钳制到 column */
  span?: number;
}

export interface DescriptionsItemProps {
  /** 键名 */
  label?: ReactNode;
  /** 跨列数，默认 1 */
  span?: number;
  /** 值内容 */
  children?: ReactNode;
  className?: string;
}

export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 标题（左上） */
  title?: ReactNode;
  /** 右上操作区 */
  extra?: ReactNode;
  /** 每行列数，默认 3 */
  column?: number;
  /** 布局：horizontal=键左值右；vertical=键上值下。默认 horizontal */
  layout?: "horizontal" | "vertical";
  /** 带边框分隔的表格态 */
  bordered?: boolean;
  /** 数据驱动备选；提供时优先于 DescriptionsItem 子节点 */
  items?: DescriptionsItemData[];
}
