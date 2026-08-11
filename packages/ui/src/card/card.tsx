import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { CardProps } from "./card.types";

// base 只放「无论哪档都成立」的东西。bg-surface 曾经也在 base 里，于是 plain 无论怎么写都去不掉底色
// （hulianui/hulian#159）—— 底色属于皮肤，跟着变体走，base 不碰。
export const cardVariants = cva("rounded-[var(--radius)] text-foreground transition-shadow", {
  variants: {
    variant: {
      outline: "border border-border bg-surface",
      elevated: "border border-hairline bg-surface shadow-sm hover:shadow-md",
      // 推荐/高亮卡片：清晰的 primary 双线描边 + 干净中性投影。
      // border-box 下 border-2 不改变外框尺寸（只内缩 1px），网格里与其余卡片对齐不偏移。
      featured: "border-2 border-primary bg-surface shadow-md",
      // 不画皮：外皮（边框/底色/阴影）由页面自己的 CSS 提供时用它，只留圆角 + 文字色 + 三段插槽语义。
      plain: "",
    },
  },
  defaultVariants: { variant: "outline" },
});

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border px-5 py-3 font-medium", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 text-sm", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-border px-5 py-3 text-sm text-muted-foreground", className)} {...props} />;
}
