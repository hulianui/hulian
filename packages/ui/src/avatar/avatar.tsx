"use client";
import { memo } from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AvatarProps } from "./avatar.types";

export const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-hover align-middle text-muted-foreground",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-16 text-lg",
        "2xl": "size-24 text-2xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

function AvatarImpl({ className, size, src, alt, fallback }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarVariants({ size }), className)}>
      {src && <BaseAvatar.Image src={src} alt={alt} className="size-full object-cover" />}
      <BaseAvatar.Fallback className="font-medium">{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
AvatarImpl.displayName = "Avatar";

// 头像永远成组出现（成员列表、评论流、协作者堆叠），父级一动就整屏重算，
// 而 props 全是原语（src/alt/size/className）——React 无法自己 bailout，只能靠 memo。
// 与 Button/Checkbox/Chip 同一处方。
export const Avatar = memo(AvatarImpl);
Avatar.displayName = "Avatar";
