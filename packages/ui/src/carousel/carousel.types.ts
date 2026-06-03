import type { HTMLAttributes, ReactNode } from "react";

/**
 * 自研 Carousel 轮播 props。
 * children = 幻灯片：每个顶层 child 渲染为一张占满视口的卡片（内部包裹 scroll-snap 容器）。
 * 受控/非受控对称：传 `current` 即受控；否则用 `defaultCurrent` + 内部 state。
 */
export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  /** 幻灯片内容（每个顶层 child 一张）。 */
  children: ReactNode;
  /** 受控当前索引（传入即受控）。 */
  current?: number;
  /** 非受控初始索引。默认 0。 */
  defaultCurrent?: number;
  /** 选中变化回调（箭头 / 圆点 / 键盘 / autoplay / 拖拽停靠均触发）。 */
  onSelect?: (index: number) => void;
  /** 自动播放。默认 false。reduced-motion 下强制关闭。 */
  autoplay?: boolean;
  /** 自动播放间隔（毫秒）。默认 4000。 */
  autoplayInterval?: number;
  /** 循环：末尾再下一张回到首张（反之亦然）。默认 false。 */
  loop?: boolean;
  /** 显示左右切换箭头。默认 true。 */
  showArrows?: boolean;
  /** 显示圆点指示器。默认 true。 */
  showDots?: boolean;
  /** region 无障碍标签。默认「轮播」。 */
  "aria-label"?: string;
  /** 每张幻灯片容器的额外类名（如固定高度 / 圆角）。 */
  slideClassName?: string;
}
