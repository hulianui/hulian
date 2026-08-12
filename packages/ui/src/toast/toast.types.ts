import type { ReactNode } from "react";

/** 复用 Alert 语义 tone，五档对齐（Alert / Tag 同一组语义 token）。 */
export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

/**
 * 视口停靠位置（#227）。toast 出现在哪个角是**产品决策**不是库决策 ——
 * 中后台常年右上，移动端与编辑器类应用常年底部，同一套组件两边都要能用。
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastProviderProps {
  /** 可选应用子树，透传渲染。不传则自闭合挂载，与页面内容并列。 */
  children?: ReactNode;
  /**
   * 视口停靠位置，默认 `"top-right"`（与历史行为一致）。
   *
   * 底部两档会把队列改成从下往上堆（最新的一条永远贴着停靠边），
   * 入场滑动方向也跟着换：左侧档从左边滑入，居中档从停靠边纵向滑入。
   *
   * 一个应用只应挂一个 `ToastProvider`，所以这个值是**全局**的；
   * 单条 toast 不能各挑各的位置。
   */
  position?: ToastPosition;
}

export interface ToastOptions {
  /** 标题（加粗主行）。 */
  title?: ReactNode;
  /** 描述（次行，恒 text-muted-foreground）。 */
  description?: ReactNode;
  /** 语调，驱动左边条 + 标题着色。默认 "neutral"。 */
  tone?: ToastTone;
  /** 自动消失毫秒数；0 = 不自动消失。缺省取 Provider 默认（5000）；`loading` 时缺省为 0。 */
  timeout?: number;
  /**
   * 「进行中」态（#227）：标题前渲一个转圈图标，且 `timeout` 缺省值从 5000 变成 **0**（不自动消失）。
   *
   * 它与 `timeout: 0` **不是两套常驻语义**，只是改了同一个 `timeout` 的默认值 ——
   * 显式传 `timeout` 依然覆盖它（`{ loading: true, timeout: 3000 }` 就是 3 秒后自己走）。
   *
   * 配 `toast.close(id)` 用：进行中那条不自己消失，等结果出来由代码关掉再弹结果，
   * 于是不会出现「正在上传…」与「上传成功」同屏并存。
   *
   * 无障碍：loading 恒走 `priority: "low"`（polite），即使 `tone="danger"` 也不升 assertive——
   * 「进行中」是陪跑不是结果，不该打断读屏正在念的东西。
   */
  loading?: boolean;
}
