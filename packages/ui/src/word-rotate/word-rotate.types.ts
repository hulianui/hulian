import type { ComponentPropsWithoutRef } from "react";

// onDrag / onDragStart / onDragEnd / onAnimationStart 被 motion 重定义为手势/动画签名，
// 与 DOM 同名 handler 冲突。本组件把 props 透传给 motion.span，故从公开类型里剔除这几个
// （对「轮换词」也无意义），避免消费方在 TS6 + motion 12 下编译冲突。
type MotionConflicts =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart";

export interface WordRotateProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children" | MotionConflicts> {
  /** 轮换的词数组 */
  words: string[];
  /** 每词停留毫秒，默认 2500 */
  duration?: number;
}
