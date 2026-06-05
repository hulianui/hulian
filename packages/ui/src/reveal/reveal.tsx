"use client";
// 通用「逐级揭示」原语族：Reveal（单块）/ Stagger（编排容器）/ StaggerItem（子项）。
// 苹果级克制：自下浮起 + filter:blur 焦点拉入，只动 transform/opacity/filter（不碰 layout）；
// 缓动取 motionEase.out（ease-out-expo，禁 bounce/elastic）；时长 motionDuration.entrance（唯一真源）。
//
// 为什么用 useInView + animate 而非 whileInView：
//   本库动效走减包 `m` + LazyMotion(domAnimation)，whileInView 依赖的 viewport 特性未必在该特性包内；
//   useInView 是独立 IntersectionObserver hook，与减包特性无关，触发绝对可靠。animate（受控）必在 domAnimation。
//
// 变体名经 React MotionContext 透传：Stagger 的 m.div animate="show" 会下达到后代 StaggerItem 的
//   m.div（仅声明 variants、不自设 animate），中间可穿过任意非 motion 节点（如 Stack）。StaggerItem
//   须置于 Stagger 内（共享其 LazyMotion 与编排）。
import { useRef } from "react";
import type { Variants } from "motion/react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { m, LazyMotionProvider } from "../motion";
import { motionDuration, motionEase } from "../motion/tokens";
import type { RevealProps, StaggerProps, StaggerItemProps } from "./reveal.types";

const VIEW_MARGIN = "-12% 0px -12% 0px"; // 进入视口前一点点就起势，避免「滚到才硬冒出来」
const ENTER = { duration: motionDuration.entrance, ease: motionEase.out };

// 单元素变体：reduced-motion 时只淡入（去一切位移/模糊/缩放，两态 DOM 一致）。
function itemVariants(
  y: number,
  blur: number,
  scale: number,
  delay: number,
  reduce: boolean,
): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: motionDuration.base, delay } },
    };
  }
  return {
    hidden: { opacity: 0, y, scale, filter: `blur(${blur}px)` },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { ...ENTER, delay },
    },
  };
}

/** 单块揭示：进入视口（或挂载）→ 浮起 + 焦点拉入。 */
export function Reveal({
  trigger = "in-view",
  once = true,
  y = 24,
  blur = 8,
  scale = 1,
  delay = 0,
  className,
  children,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: VIEW_MARGIN });
  const active = trigger === "mount" ? true : inView;
  return (
    <LazyMotionProvider>
      <m.div
        ref={ref}
        className={cn(className)}
        variants={itemVariants(y, blur, scale, delay, reduce)}
        initial="hidden"
        animate={active ? "show" : "hidden"}
        {...rest}
      >
        {children}
      </m.div>
    </LazyMotionProvider>
  );
}

/** 编排容器：进入视口（或挂载）时按 gap 依次唤醒内部的 StaggerItem（变体名经 context 透传，可穿过 Stack）。 */
export function Stagger({
  trigger = "in-view",
  once = true,
  gap = 0.08,
  delay = 0,
  className,
  children,
  ...rest
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: VIEW_MARGIN });
  const active = trigger === "mount" ? true : inView;
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
  return (
    <LazyMotionProvider>
      <m.div
        ref={ref}
        className={cn(className)}
        variants={container}
        initial="hidden"
        animate={active ? "show" : "hidden"}
        {...rest}
      >
        {children}
      </m.div>
    </LazyMotionProvider>
  );
}

/** Stagger 子项：自身不触发，等容器下达 "show"。须置于 <Stagger> 内。 */
export function StaggerItem({
  y = 18,
  blur = 8,
  scale = 1,
  className,
  children,
  ...rest
}: StaggerItemProps) {
  const reduce = useReducedMotion() ?? false;
  return (
    <m.div className={cn(className)} variants={itemVariants(y, blur, scale, 0, reduce)} {...rest}>
      {children}
    </m.div>
  );
}
