import type { ComponentPropsWithoutRef } from "react";

/** 与 motion/react 在 m.p 上重名、需从原生 p 属性里剔除的事件，避免类型冲突 */
type MotionConflicts =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart";

export interface ScrollRevealProps
  extends Omit<ComponentPropsWithoutRef<"p">, "children" | MotionConflicts> {
  /** 要随滚动逐词显影的整段文本（仅字符串，内部按空白拆词并保留分隔符） */
  children: string;
  /**
   * 静息（尚未滚入解析区间）时每个词的基础透明度，取值 0~1。
   * 越小入场对比越强；默认 0.12。
   */
  baseOpacity?: number;
  /**
   * 整段文字进入时的初始旋转角（deg），随滚动进度回正到 0，营造「立起来」的纵深感。
   * 设为 0 可关闭旋转；默认 3。
   */
  baseRotation?: number;
  /**
   * 是否伴随模糊解析：未揭示词带模糊，随进度消散到清晰。
   * 关闭后仅做透明度与旋转动画；默认 true。
   */
  enableBlur?: boolean;
  /** enableBlur 为真时词的起始模糊半径（px），随进度降到 0；默认 4 */
  blurStrength?: number;
}
