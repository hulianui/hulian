import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { CodeProps } from "./code.types";

// 纯皮肤行内代码 <code>（可 RSC）。tone 走语义 token。
export const codeVariants = cva(
  // 长内容的折行（#code-ux）：
  // - 不用 whitespace-nowrap：一条长路径 / 长 URL 在窄容器（手机、侧栏、表格格子）里会直接撑破布局，
  //   比「chip 裂成两行」难看得多，而且消费方无从修复。
  // - [overflow-wrap:anywhere]：只在整段放不下一行时才从中间断，短 token 仍整体换到下一行；
  //   同时把 min-content 宽度放开，flex / grid 子项里也不会把轨道顶宽。
  // - box-decoration-clone：真的折成两行时，每一截都各自带圆角与内边距，读起来是两个完整的 chip，
  //   而不是一个被拦腰截断、左右各缺一边的色块。
  // shadow-xs：浮起半毫米 + 发丝边，让 chip 在正文里有轮廓而不只是一块底色（暗色走白色轮缘光，见 tokens）。
  // 刻意不加 border：带 border + 更重投影的是 Kbd（键帽），两者在一段话里常并排出现，得一眼分得开。
  "box-decoration-clone [overflow-wrap:anywhere] rounded-[min(var(--radius),0.375rem)] px-1.5 py-0.5 font-mono text-[0.85em] shadow-xs",
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
