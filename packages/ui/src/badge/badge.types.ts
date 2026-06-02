import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "./badge";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}
