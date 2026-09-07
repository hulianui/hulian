"use client";
import { memo } from "react";
import { type HTMLMotionProps, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { shimmer, LazyMotionProvider, m } from "../motion";
import { skeletonVariants } from "./skeleton.variants";
import type { SkeletonProps } from "./skeleton.types";

// 皮肤本体搬去了 ./skeleton.variants（纯数据、零依赖），这里原样再导出一次：
// 既有 `from "./skeleton"` / `from "../skeleton"` 的引用一个都不用改。
export { skeletonVariants };

function SkeletonImpl({ className, shape, ...props }: SkeletonProps) {
  const reduce = useReducedMotion();
  const baseClass = cn(skeletonVariants({ shape }), "relative overflow-hidden", className);

  // 减弱动效（#350）：退成静态灰块，不挂 shimmer。
  //
  // 为什么骨架属于「最该关掉」的那一类：一屏往往同时几十块（TableSkeleton 8×5 就是 40 块），
  // 每块都在无限循环，加起来是整屏持续晃动；而骨架的信息量全在**形状**（预留了多大一块、
  // 是文本还是头像），扫光只表达「还在加载」，这层意思由 role=status 的无障碍文案承担，
  // 去掉不丢信息。所以不选「整块不渲染」——那会丢掉占位几何，页面会塌。
  //
  // 连渐变背景一起去掉：backgroundPosition 不再有人推动，留着等于把那道高光钉死在起点，
  // 看着像渲染残留（同 BorderBeam #300 的判断）。
  //
  // 注意 shimmer 是 motion 驱动的 backgroundPosition 补间，不是 CSS 动画，
  // Tailwind 的 `motion-reduce:` 类变体够不着它，只能靠 useReducedMotion 判。
  if (reduce) {
    return <div aria-hidden className={baseClass} {...props} />;
  }

  return (
    // 减包：m + LazyMotionProvider(domAnimation) 取代全量 motion
    <LazyMotionProvider>
      <m.div
        aria-hidden
        className={baseClass}
        style={{
          backgroundImage: "linear-gradient(90deg, transparent 0%, var(--color-surface) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          backgroundRepeat: "no-repeat",
        }}
        animate={shimmer.animate}
        transition={shimmer.transition}
        {...(props as HTMLMotionProps<"div">)}
      />
    </LazyMotionProvider>
  );
}
SkeletonImpl.displayName = "Skeleton";

// 骨架屏一屏几十块（表格行、卡片网格、列表），且加载期间父级往往在高频更新（计时器/请求状态），
// props 全是原语时 React 无法自己 bailout —— 与 Button/Checkbox/Chip 同一处方。
export const Skeleton = memo(SkeletonImpl);
Skeleton.displayName = "Skeleton";
