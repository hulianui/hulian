"use client";
import { memo } from "react";
import { type HTMLMotionProps } from "motion/react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { shimmer, LazyMotionProvider, m } from "../motion";
import type { SkeletonProps } from "./skeleton.types";

export const skeletonVariants = cva("bg-surface-hover", {
  variants: {
    shape: {
      text: "h-4 w-full rounded",
      circle: "rounded-full",
      rect: "rounded-[var(--radius)]",
    },
  },
  defaultVariants: { shape: "text" },
});

function SkeletonImpl({ className, shape, ...props }: SkeletonProps) {
  return (
    // 减包：m + LazyMotionProvider(domAnimation) 取代全量 motion
    <LazyMotionProvider>
      <m.div
        aria-hidden
        className={cn(skeletonVariants({ shape }), "relative overflow-hidden", className)}
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
