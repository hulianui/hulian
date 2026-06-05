import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { CardProps } from "./card.types";

export const cardVariants = cva("rounded-[var(--radius)] bg-surface text-foreground transition-shadow", {
  variants: {
    variant: {
      outline: "border border-border",
      elevated: "border border-border shadow-sm hover:shadow-md",
      // 推荐/高亮卡片：清晰的 primary 双线描边 + 干净中性投影。
      // border-box 下 border-2 不改变外框尺寸（只内缩 1px），网格里与其余卡片对齐不偏移。
      featured: "border-2 border-primary shadow-md",
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
  return <div className={cn("border-t border-border px-5 py-3 text-sm text-muted", className)} {...props} />;
}
