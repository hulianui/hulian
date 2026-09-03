import type { ReactNode } from "react";

export interface ScrollAreaProps {
  /** 滚动方向，默认 vertical；both 时双向滚动条 + corner。 */
  orientation?: "vertical" | "horizontal" | "both";
  /** 限高/限宽由消费者经 className 给 Root（如 h-48 / w-64）。 */
  className?: string;
  /**
   * 追加到内层视口（真正的滚动盒 · #340）。
   *
   * `className` 落在 Root 上，而裁剪发生在视口：声明了 `vertical`，视口就带 `overflow-x: hidden`，
   * 于是**贴边元素向外扩的那几像素会被切掉** —— 最常见的是 `w-full` 表单控件聚焦时
   * `ring-2 + ring-offset-2` 的左右两条竖边整条消失，只剩上下两条线。给 Root 加内边距救不了，
   * 因为裁的是视口。传 `px-1.5` 之类给视口留出余量即可。
   *
   * 不做成默认值：留白该加在滚动容器上还是各列上只有消费方知道，默认给一份会让
   * 「内容宽度 = 视口宽度」这个多数场景平白缩窄。
   */
  viewportClassName?: string;
  children?: ReactNode;
}
