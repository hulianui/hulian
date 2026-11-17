"use client";
import { memo } from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AvatarProps } from "./avatar.types";

export const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full align-middle",
  {
    variants: {
      // 占位底色档（图片加载出来就盖住了，只影响 fallback 与透明 PNG）。
      // brand：主色浅底 + 主色字，给「这是品牌 / 系统 / AI 自己」的头像，或想让首字头像带主题色。
      tone: {
        neutral: "bg-surface-hover text-muted-foreground",
        brand: "bg-primary-subtle font-semibold text-primary",
      },
      // 外圈描边：头像压在彩色底 / 照片上、或成组堆叠时把轮廓勾出来。颜色按 tone 取，
      // 中性档取 border —— 在主色卡（反色表面）里它会自动变成半透明白圈。
      ring: { true: "ring-2", false: "" },
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-16 text-lg",
        "2xl": "size-24 text-2xl",
      },
    },
    compoundVariants: [
      { tone: "neutral", ring: true, class: "ring-border" },
      { tone: "brand", ring: true, class: "ring-primary-border" },
    ],
    defaultVariants: { size: "md", tone: "neutral", ring: false },
  },
);

function AvatarImpl({ className, size, tone, ring, src, alt, fallback }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarVariants({ size, tone, ring }), className)}>
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
