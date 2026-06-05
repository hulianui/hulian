import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { ProseProps, ProseSize } from "./prose.types";

// 富文本 / markdown 排版容器（可 RSC，本体不加 "use client"）。
// 用后代选择器把标题/段落/列表/代码/引用/表格统一吃语义 token —— 消费者只管把渲染好的 HTML/JSX
// 塞进来（如 markdown→HTML、dangerouslySetInnerHTML、MDX 输出），排版样式由本容器统一接管。
// 全程零依赖、只消费语义 token，明暗自适配。
const proseBase = cn(
  "text-foreground leading-7",
  // 首尾子元素去外边距，间距由容器自身控制
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  // 标题：Tailwind preflight 把标题字号重置为继承（=正文），故必须显式给字号，
  // 否则 h1~h4 仅字重不同、字号全等于正文，标题层级塌成一片。
  "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:text-foreground",
  "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-foreground",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground",
  "[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground",
  // 段落
  "[&_p]:my-4",
  // 强调
  "[&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic",
  // 链接
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary-hover",
  // 列表
  "[&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal",
  "[&_li]:my-1 [&_li]:marker:text-muted",
  // 行内代码（排除 pre 内的 code）
  "[&_:not(pre)>code]:rounded-[min(var(--radius),0.375rem)] [&_:not(pre)>code]:bg-surface-hover [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em]",
  // 代码块
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius)] [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:font-mono",
  // 引用
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted",
  // 分隔线 / 图片
  "[&_hr]:my-8 [&_hr]:border-border [&_img]:my-4 [&_img]:rounded-[var(--radius)]",
  // 表格
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border-b [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-b [&_td]:border-border [&_td]:p-2",
);

const SIZE: Record<ProseSize, string> = {
  sm: "text-sm",
  base: "text-base",
};

export function Prose({ as, size = "base", className, ...props }: ProseProps) {
  const Comp = (as ?? "article") as ElementType;
  return <Comp className={cn(proseBase, SIZE[size], className)} {...props} />;
}
