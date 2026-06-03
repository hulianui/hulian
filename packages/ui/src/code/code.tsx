import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { CodeProps } from "./code.types";

// 纯皮肤行内代码 <code>（可 RSC）。tone 走语义 token。
export const codeVariants = cva(
  // whitespace-nowrap：行内代码不从 token 中间断行（否则带背景/内边距的 chip 裂成两行很丑）；
  // 短 token 整体随行流动，超长片段本就该用块级 CodeBlock。
  "whitespace-nowrap rounded-[min(var(--radius),0.375rem)] px-1.5 py-0.5 font-mono text-[0.85em]",
  {
    variants: {
      tone: {
        default: "bg-surface-hover text-foreground",
        primary: "bg-primary/12 text-primary",
        danger: "bg-danger/12 text-danger",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export function Code({ tone, className, children, ...props }: CodeProps) {
  return (
    <code className={cn(codeVariants({ tone }), className)} {...props}>
      {children}
    </code>
  );
}
