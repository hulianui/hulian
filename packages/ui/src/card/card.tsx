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

// 分隔线同样是皮肤而不是结构，所以 divided=false 要能整卡关掉（#203 —— #159 那条原则延伸到分区）。
// 走「Card 上的直接子选择器」而不是 context 下发：Card 至今没有 "use client"，为一个布尔值把整张卡
// 拖进 client 边界不划算；限定直接子（>）则卡里套卡时外层的取值不会传染给内层。
// 关线的同时收内边距：那段呼吸本来是分隔线撑着的，只去线会剩下一道无来由的留白。
const undividedSlots =
  "[&>[data-slot=card-header]]:border-b-0 [&>[data-slot=card-header]]:pb-2 " +
  "[&>[data-slot=card-footer]]:border-t-0 [&>[data-slot=card-footer]]:pt-2";

export function Card({ className, variant, divided, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant }), divided === false && undividedSlots, className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn("border-b border-border px-5 py-3 font-medium", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-body" className={cn("px-5 py-4 text-sm", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("border-t border-border px-5 py-3 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
