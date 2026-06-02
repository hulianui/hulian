"use client";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AvatarProps } from "./avatar.types";

export const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-hover align-middle text-muted",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function Avatar({ className, size, src, alt, fallback }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarVariants({ size }), className)}>
      {src && <BaseAvatar.Image src={src} alt={alt} className="size-full object-cover" />}
      <BaseAvatar.Fallback className="font-medium">{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
