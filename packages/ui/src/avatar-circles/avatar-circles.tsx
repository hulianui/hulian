import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AvatarCirclesProps } from "./avatar-circles.types";

// 吸取自 magicui.design AvatarCircles：堆叠重叠的头像组 + "+N" 计数圆（可 RSC，纯皮肤）。
// 瑚琏化：环线 ring 用 bg token（亮/暗自动）、+N 圆用 primary token，替 magicui 写死 white/black。
const sizes = {
  sm: { box: "size-7 text-[10px]", ring: "ring-2", ml: "-ml-2" },
  md: { box: "size-9 text-xs", ring: "ring-2", ml: "-ml-3" },
  lg: { box: "size-11 text-sm", ring: "ring-[3px]", ml: "-ml-4" },
} as const;

export const avatarCirclesItemVariants = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-bg",
);

export function AvatarCircles({ avatars, extraCount, size = "md", className }: AvatarCirclesProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center", className)}>
      {avatars.map((a, i) => (
        <img
          key={i}
          src={a.src}
          alt={a.alt ?? ""}
          className={cn(avatarCirclesItemVariants(), s.box, s.ring, "object-cover", i > 0 && s.ml)}
        />
      ))}
      {extraCount != null && extraCount > 0 && (
        <span
          className={cn(
            avatarCirclesItemVariants(),
            s.box,
            s.ring,
            s.ml,
            "bg-primary font-medium text-primary-foreground",
          )}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
}
