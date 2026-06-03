"use client";
import { LazyMotion, domAnimation, m } from "motion/react";
import type { ReactNode } from "react";

// 减包：用 m + domAnimation 取代全量 motion。
// `motion.*` 会把 motion 的全部 DOM features 打进首屏 bundle；`m` 是 mini 组件、不自带 features，
// 由 LazyMotion 注入 `domAnimation`（基础动画 + 手势 + SVG，~一半体积；不含 drag/layout——本库无组件用到）。
// 组件库不能假设消费方在根部包了 LazyMotion，故每个动效组件自包一层 <LazyMotionProvider>：
// 它是 context provider，不渲染 DOM、零布局开销，且 domAnimation 模块全局只打一份。
// strict：在其内部误用 `motion.*` 会抛错，兜底防止减包被悄悄破坏。
export { m };

export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
