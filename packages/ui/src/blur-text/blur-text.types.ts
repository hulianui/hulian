import type { ComponentPropsWithoutRef } from "react";

// onDrag / onDragStart / onDragEnd / onAnimationStart 被 motion 重定义为手势/动画签名，
// 与原生 DOM 同名 handler 冲突；本组件把 props 透传给根 <p>（motion 元素），故剔除避免 TS 冲突。
type MotionConflicts = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart";

/** 进出场方向：`top` 从上方落入、`bottom` 从下方浮入（影响 y 位移与中段过冲方向） */
export type BlurDirection = "top" | "bottom";

/** 切分粒度：`word` 按空白逐词、`char` 逐字符（中文友好） */
export type BlurSplit = "char" | "word";

export interface BlurTextProps
  extends Omit<ComponentPropsWithoutRef<"p">, "children" | MotionConflicts> {
  /** 要逐段模糊浮现的文本 */
  text: string;
  /** 切分粒度：`word` 逐词（按空白切）/ `char` 逐字（中文友好）。默认 `word` */
  splitType?: BlurSplit;
  /** 进场方向（伴随 y 位移与中段过冲）。默认 `top` */
  direction?: BlurDirection;
  /**
   * 相邻段（词/字符）之间的入场错峰，单位毫秒。
   * 数值越大波浪推进越慢、错落越明显。默认 120。
   */
  delay?: number;
  /** 起始模糊像素（解析到 0 时清晰）。默认 8 */
  blur?: number;
  /**
   * 单段从「起始」到「清晰」的整体时长（秒）。内部分两步（先到半清晰再到全清晰）。
   * 默认 0.5。
   */
  stepDuration?: number;
  /**
   * 触发动画的视口可见比例（useInView amount），0~1。
   * 默认 0.3（露出三成即开始）。
   */
  threshold?: number;
  /** 末段动画结束回调（整句浮现完成时触发一次） */
  onAnimationComplete?: () => void;
}
