import type { CSSProperties, RefObject } from "react";

export interface ScrollVelocityProps {
  /**
   * 多行滚动文本，每一行渲染为独立的速度跑马灯；
   * 偶数行向左、奇数行向右（方向交替），形成视差错位。
   * 默认：[]
   */
  texts?: string[];
  /**
   * 基础滚动速度（px/秒），静止时也会持续匀速漂移，默认 100。
   * 越大跑得越快；为负则整体反向。
   */
  velocity?: number;
  /**
   * 弹簧阻尼，控制滚动速度变化的「黏滞感」，默认 50。
   * 越大回弹越慢越稳，越小越灵敏。
   */
  damping?: number;
  /**
   * 弹簧刚度，控制速度跟手的「劲道」，默认 400。
   * 越大越紧绷跟手，越小越绵软。
   */
  stiffness?: number;
  /**
   * 每行文本复制份数（用于无缝循环铺满），默认 6。
   * 文本越短需要越多份才能铺满视口宽度。
   */
  numCopies?: number;
  /**
   * 滚动速度 → 加速因子的映射区间。
   * input 为滚动速度范围、output 为对应的加速倍率（clamp:false 允许外推）。
   * 默认：{ input: [0, 1000], output: [0, 5] }
   */
  velocityMapping?: { input: [number, number]; output: [number, number] };
  /**
   * 自定义滚动容器引用；不传则监听 window 滚动。
   * 用于把速度感应绑定到某个内部可滚动区域。
   */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /**
   * 透传到每行文本 span 的额外 className（字号 / 字色 / 字重）。
   */
  className?: string;
  /**
   * 透传到根 section 的额外 className。
   */
  containerClassName?: string;
  /**
   * 透传到每行外层（parallax）容器的内联样式。
   */
  parallaxStyle?: CSSProperties;
  /**
   * 透传到每行滚动轨（scroller）的内联样式。
   */
  scrollerStyle?: CSSProperties;
}
