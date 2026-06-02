import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { skeletonVariants } from "./skeleton";

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "style">,
    VariantProps<typeof skeletonVariants> {}
