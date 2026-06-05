import type { ComponentPropsWithoutRef, RefObject } from "react";

// onDrag / onDragStart / onDragEnd / onAnimationStart 被 motion 重定义为手势/动画签名，
// 与 DOM 同名 handler 冲突。本组件根 <h2> 透传 props 给非 motion 元素，这几个对「滚动浮现标题」
// 也无意义，故从公开类型剔除，避免 TS6 + motion 12 下编译冲突。
type MotionConflicts = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart";

export interface ScrollFloatProps
  extends Omit<ComponentPropsWithoutRef<"h2">, "children" | MotionConflicts> {
  /** 要逐字符滚动浮现的文本（仅字符串，非字符串会被忽略为空） */
  children: string;
  /**
   * 自定义滚动容器引用。默认绑定标题自身相对视口的滚动进度；
   * 传入可滚动祖先（如弹层/抽屉内的滚动区）时，进度改按该容器测量。
   */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /**
   * 进度映射区间 [start, end]，对应 useScroll 的 offset。
   * 默认 ["start 0.9", "start 0.35"]：标题顶进入视口 90% 处开始、到 35% 处完成。
   */
  offset?: [string, string];
  /** 字符间错峰强度（0~1），每个字符的进度窗口相对整体的偏移比例。默认 0.4 */
  stagger?: number;
  /** 初始下沉位移百分比（相对字高），随进度回到 0。默认 120 */
  yPercent?: number;
  /** 初始纵向拉伸倍率，随进度回到 1（配合横向压扁形成「拔起」拉丝感）。默认 2.3 */
  scaleY?: number;
  /** 初始横向压扁倍率，随进度回到 1。默认 0.7 */
  scaleX?: number;
  /** 标题外层容器类名（裁切溢出的滚动浮现） */
  containerClassName?: string;
  /** 文本层类名（控制字号/字重/对齐） */
  textClassName?: string;
}
