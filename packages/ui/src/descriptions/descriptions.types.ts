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

/** 密度档。sm 用于字段多、要在一屏里看完的详情页 */
export type DescriptionsSize = "sm" | "md";

/**
 * 键与值的纵向对齐。
 *
 * 默认跟布局走（表格态=顶对齐撑满、纯文本态=基线对齐），值区放图片 / 头像 / 标签组这类
 * 比文字高的东西时才需要显式指定。
 */
export type DescriptionsAlign = "baseline" | "start" | "center";

export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 标题（左上） */
  title?: ReactNode;
  /** 右上操作区 */
  extra?: ReactNode;
  /**
   * 每行**最多**几列，默认 3。
   *
   * 实际列数按**容器宽度**（不是视口）自动降档：窄到放不下时依次退到 2 列、1 列。
   * 详情页常被塞进抽屉 / 分栏，视口断点在那里是错的判据 —— 视口很宽而这块只有 380px。
   */
  column?: number;
  /** 布局：horizontal=键左值右；vertical=键上值下。默认 horizontal */
  layout?: "horizontal" | "vertical";
  /** 带边框分隔的表格态 */
  bordered?: boolean;
  /** 密度档，默认 md */
  size?: DescriptionsSize;
  /**
   * 键列宽度（horizontal 专用）。不传时**由整表最长的那个键名决定并逐列对齐**。
   *
   * 传值的场合只有一个：上下两张表要对齐（例如「基本信息」和「执行明细」两块），
   * 它们各自算出来的键列宽不一样，得钉同一个数。数字按 px 处理。
   */
  labelWidth?: number | string;
  /**
   * 值为空时的占位，默认 `"—"`。空的判据是 `null` / `undefined` / `""` / `false`；
   * 数字 `0` 是事实值，照常渲染。
   *
   * 后台数据大量为空，没有这一层时每个调用点都要写 `?? "—"`，而漏写的那格会塌成空白 ——
   * 空白与「这个字段不存在」在详情页里是两件事。传 `null` 可以关掉它。
   */
  emptyText?: ReactNode;
  /** 键与值的纵向对齐；不传时跟布局走 */
  align?: DescriptionsAlign;
  /** 数据驱动备选；提供时优先于 DescriptionsItem 子节点 */
  items?: DescriptionsItemData[];
}
