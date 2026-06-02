import type { Transition } from "motion/react";
import { motionDuration, motionEase } from "./tokens";

// 瑚琏动效预设 —— 组件按场景直接摊开使用，统一手感来自 ./tokens。

// press 反馈：轻微缩放，纯减速无回弹。给可点击元素的 whileTap 用。
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: { duration: motionDuration.fast, ease: motionEase.out } satisfies Transition,
};

// 进出场：fade + scale。overlay（Dialog/Popover）与卡片通用的进场/退场。
// 用于 motion 组件时摊开 initial/animate/exit；Base UI 这类自管 mount 的组件
// 不接 AnimatePresence，改用 ./tokens 的 CSS 镜像驱动其原生过渡（见 dialog.tsx）。
export const fadeScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: motionDuration.base, ease: motionEase.out } satisfies Transition,
};

// shimmer：循环高光扫过的占位动效，给 Skeleton 用。配渐变背景 + backgroundSize:200%。
export const shimmer = {
  animate: { backgroundPosition: ["200% 0", "-200% 0"] as string[] },
  transition: { repeat: Infinity, duration: 1.4, ease: "linear" as const },
};
