"use client";
import { Input as BaseInput } from "@base-ui/react/input";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import type { InputProps } from "./input.types";

// 外壳承载视觉：border/bg/圆角/focus-ring/invalid/disabled。内层 Base Input 透明。
// invalid 两条驱动路统一在 has-[[data-invalid]]：
//   · Field 内 → Field.Root invalid 让控件得 data-invalid
//   · 独立 → 下面把 invalid 翻译成 data-invalid 落到内层 input
export const inputShellVariants = cva(
  [
    "inline-flex w-full items-center gap-2 text-foreground transition-colors",
    "has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none",
  ],
  {
    variants: {
      // cell = 表格单元格里的就地编辑器：单元格本身就是输入框，密集成片地铺。
      // default 那身外壳（边框 + 底色 + 固定行高 + 焦点环）在这种场合是「盒子套盒子」，
      // 一屏几十个框；而 focus ring 有 2px 环 + 2px offset，会溢出单元格顶到相邻格（#149）。
      //
      // 焦点指示改用「浅底 + 内嵌下划线」：
      //   · 内嵌（inset box-shadow）而不是 border-b，因为 border 会占 2px 高度 —— 单元格
      //     无内距时那 2px 直接推动整行，聚焦一下表格抖一下；inset 画在盒内，零布局位移。
      //   · 只靠浅底不够：bg-primary-subtle 与 surface 的对比达不到焦点指示要求的 3:1，
      //     下划线取实心 primary 才是那条可达标的线。两者一起给「在编辑」的语义 + 可达性。
      variant: {
        default: [
          "rounded-[var(--radius)] border border-border bg-surface",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
          "has-[[data-invalid]]:border-danger has-[[data-invalid]]:focus-within:ring-danger",
        ],
        cell: [
          "rounded-sm border-0 bg-transparent p-0",
          "focus-within:bg-primary-subtle focus-within:shadow-[inset_0_-2px_0_0_var(--color-primary)]",
          "has-[[data-invalid]]:shadow-[inset_0_-2px_0_0_var(--color-danger)]",
        ],
      },
      // 只管字号：高度与内距是 default 外壳的事，cell 没有外壳也就没有这两样，
      // 所以它们下沉到 compoundVariants，否则 cell 会继承一个 h-10 把行撑起来。
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base",
      },
    },
    compoundVariants: [
      { variant: "default", size: "sm", class: "h-8 px-2.5" },
      { variant: "default", size: "md", class: "h-10 px-3" },
      { variant: "default", size: "lg", class: "h-12 px-3.5" },
    ],
    defaultVariants: { size: "md", variant: "default" },
  },
);

// ref 转发到真正的 <input>（不是外壳 span）：focus()/select()/取 .value、以及 react-hook-form
// 的 register() 都指望拿到原生控件。此前不转发，消费方只能「受控值 + 包一层容器查询 DOM」绕。
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, variant, invalid, prefix, suffix, ...props },
  ref,
) {
  return (
    <span className={cn(inputShellVariants({ size, variant }), className)}>
      {prefix != null && <span className="shrink-0 text-muted-foreground">{prefix}</span>}
      <BaseInput
        ref={ref}
        {...props}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
      {suffix != null && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
    </span>
  );
});
