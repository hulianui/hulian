import type { HTMLAttributes, ReactNode } from "react";

export interface AnchorItem {
  /** 目标锚点，形如 "#section-id"（对应页面中元素的 id） */
  href: string;
  /** 显示标题 */
  title: ReactNode;
  /** 二级子项（嵌套一层，缩进展示） */
  children?: AnchorItem[];
}

export interface AnchorProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** 锚点项数组，支持一层 children 形成二级 */
  items: AnchorItem[];
  /**
   * 滚动定位时在目标顶部预留的偏移量（px），用于避开固定页头。
   * 同时收缩 scrollspy 观测区上沿。默认 0。
   */
  offsetTop?: number;
  /** 当前激活锚点变化时回调（点击或滚动驱动均触发，同值不重复触发） */
  onChange?: (href: string) => void;
}
