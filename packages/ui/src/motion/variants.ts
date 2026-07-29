import type { Transition } from "motion/react";
import { motionDuration, motionEase } from "./tokens";

// 瑚琏动效预设 —— 组件按场景直接摊开使用，统一手感来自 ./tokens。

// press 反馈：轻微缩放，纯减速无回弹。给可点击元素的 whileTap 用。
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: { duration: motionDuration.fast, ease: motionEase.out } satisfies Transition,
};

// press 反馈的**纯 CSS 版**：同手感（scale .97 / fast / ease-out），零 motion 运行时。
//
// 为什么需要两份：`pressable` 要求组件挂 <m.button> + LazyMotionProvider，对 Tag/Segmented/
// Choicebox 这类本来不引 motion 的组件是净增包体积。CSS 版直接贴 className 即可，
// 让"按下去有反应"这件事能铺满全库，而不是只有 Button 一个组件享受。
//
// duration-150 / ease-out 分别对齐 motionDuration.fast 与 motionEase.out —— ease-out 工具类
// 的曲线由 @hulianui/tokens preset.css 的 @theme 覆写为瑚琏曲线，故此处与 JS 侧同源。
//
// ⚠️ 用法：**放在 cn() 末尾、替换掉组件原有的 transition-colors / transition-[...]**。
// 它自带一份完整的 transition-property 列表（scale + 常见颜色/阴影/滤镜），因为 tailwind-merge
// 会把 transition-* 视作同一组、只保留最后一个 —— 若与 transition-colors 并列，先写的那个会被
// 整条丢弃，导致要么颜色不过渡、要么按压不过渡。列表里带上颜色项即可平替原类，语义不丢。
// 另：Tailwind v4 下 scale-* 编译为独立的 scale 属性（不是 transform），故 property 必须显式列 scale。
export const pressableClass =
  "transition-[scale,background-color,border-color,color,box-shadow,filter,opacity] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

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
