import type { CSSProperties } from "react";

/** 单个导航项 */
export interface GooeyNavItem {
  /** 显示文案 */
  label: string;
  /** 链接地址，默认 "#" */
  href?: string;
}

export interface GooeyNavProps {
  /**
   * 导航项数组，每项含 label（必填）与 href（可选）。
   * 至少 1 项；选中态由内部维护或由 activeIndex 受控。
   */
  items: GooeyNavItem[];
  /**
   * 初始选中项下标，默认 0。仅在非受控（未传 activeIndex）时生效。
   */
  initialActiveIndex?: number;
  /**
   * 受控选中下标。传入即受控，选中态完全由父级驱动，
   * 内部仍触发 onChange 但不自行改变高亮位置。
   */
  activeIndex?: number;
  /**
   * 选中项变化回调，参数为新下标。点击 / 键盘 Enter|Space 均触发。
   */
  onChange?: (index: number) => void;
  /**
   * 单次粒子迸射的基准时长（毫秒），默认 600。
   * 影响药丸滑动与粒子动画的整体节奏，越大越缓。
   */
  animationTime?: number;
  /**
   * 每次切换迸射的粒子数量，默认 14。0 关闭粒子（仅保留药丸滑动）。
   */
  particleCount?: number;
  /**
   * 粒子飞行的[起始, 收束]半径（px），默认 [86, 12]。
   * 第一个值决定爆开范围，第二个值决定回落到药丸的收束半径。
   */
  particleDistances?: [number, number];
  /**
   * 粒子调色板，取瑚琏 chart token 序号（1..5），默认 [1, 2, 3, 1, 4]。
   * 每颗粒子从中随机取色，自动吃明暗主题。
   */
  colors?: number[];
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
