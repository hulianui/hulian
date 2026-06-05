import type { ComponentPropsWithoutRef } from "react";

// onDrag/onDragStart/onDragEnd/onAnimationStart 被 motion 重定义为手势/动画签名，
// 与 DOM 同名 handler 冲突；本组件外层是普通 span 不透传给 m.*，但保持与 WordRotate 一致剔除习惯。
type MotionConflicts = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart";

export type SplitFrom = "bottom" | "top" | "left" | "right";
export type SplitType = "char" | "word";

export interface SplitTextProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children" | MotionConflicts> {
  /** 要逐段进场的文本 */
  text: string;
  /** 切分粒度：char 逐字（中文友好）/ word 逐词（按空白切）。默认 char */
  splitType?: SplitType;
  /** 进场方向（每段从该方向位移入场）。默认 bottom */
  from?: SplitFrom;
  /** 相邻段错峰毫秒。默认 40 */
  delay?: number;
  /** 单段动画时长（秒）。默认 0.5 */
  duration?: number;
}
