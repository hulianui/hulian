import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { avatarVariants } from "./avatar";

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
}
