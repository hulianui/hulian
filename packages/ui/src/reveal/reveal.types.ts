import type { ComponentPropsWithoutRef } from "react";

// onDrag* / onAnimationStart 被 motion 重定义为手势/动画签名，与 DOM 同名 handler 冲突；
// 本组件把 props 透传给 m.div，剔除这几个避免 TS 冲突（同 scroll-float 约定）。
type MotionConflicts = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart";

interface RevealCommon extends Omit<ComponentPropsWithoutRef<"div">, MotionConflicts> {
  /** 触发时机：进入视口（默认）/ 挂载即播（首屏 hero 用 mount） */
  trigger?: "in-view" | "mount";
  /** in-view 时是否只播一次。默认 true */
  once?: boolean;
}

export interface RevealProps extends RevealCommon {
  /** 起始下移距离 px（自下浮起）。默认 24 */
  y?: number;
  /** 起始模糊 px（焦点拉入，GPU 合成）。默认 8 */
  blur?: number;
  /** 起始缩放（<1 像「放上书架」般落位）。默认 1（不缩放） */
  scale?: number;
  /** 延迟秒数（独立块错峰用；在 Stagger 内由容器编排，无需 delay） */
  delay?: number;
}

export interface StaggerProps extends RevealCommon {
  /** 子项间错峰秒数。默认 0.08 */
  gap?: number;
  /** 整组起始延迟秒数。默认 0 */
  delay?: number;
}

export interface StaggerItemProps extends Omit<ComponentPropsWithoutRef<"div">, MotionConflicts> {
  /** 起始下移距离 px。默认 18 */
  y?: number;
  /** 起始模糊 px。默认 8 */
  blur?: number;
  /** 起始缩放（<1 像「放上书架」）。默认 1 */
  scale?: number;
}
