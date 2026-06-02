"use client";
import { motion, type HTMLMotionProps } from "motion/react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { shimmer } from "../motion";
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

export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <motion.div
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
  );
}
