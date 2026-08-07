"use client";
import { cloneElement, forwardRef, memo, type ReactNode } from "react";
import { type HTMLMotionProps } from "motion/react";
import { cva } from "class-variance-authority";
import { Loader2 } from "../_icons";
import { cn } from "../lib/cn";
import { pressable, LazyMotionProvider, m } from "../motion";
import { BUTTON_BASE_CLASS, BUTTON_SIZE_CLASS } from "./button-base";
import type { ButtonProps } from "./button.types";

export const buttonVariants = cva(BUTTON_BASE_CLASS, {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow",
        outline: "border border-hairline bg-surface text-foreground shadow-sm hover:bg-surface-hover",
        ghost: "text-foreground hover:bg-surface-hover",
        // 文字链接按钮：零横向内边距，文字直接贴单元格/容器左缘，用于表格行内操作（查看/编辑）等。
        link: "text-primary underline-offset-4 hover:underline",
      },
      // 语义档。取值集是 conventions 里「语义 tone SSOT」的全集，其余组件按各自能表达的范围裁剪子集。
      // brand 是 primary 的对外名字（历史遗留的两种叫法，Button 以 brand 为准）。
      tone: { brand: "", success: "", warning: "", danger: "", neutral: "" },
      size: BUTTON_SIZE_CLASS,
      // 块级铺满：移动端主操作、表单底部提交几乎必用，此前只能写 className="w-full"。
      block: { true: "w-full" },
    },
    compoundVariants: [
      // solid：语义底 + 对应前景 + 独立的 hover 档。0.27.0 前 danger 的 hover 写回自身
      // （hover:bg-danger），等于危险按钮没有悬停反馈——tokens 补齐 *-hover 后一并修掉。
      {
        variant: "solid",
        tone: "danger",
        class: "bg-danger text-danger-foreground hover:bg-danger-hover",
      },
      {
        variant: "solid",
        tone: "success",
        class: "bg-success text-success-foreground hover:bg-success-hover",
      },
      {
        variant: "solid",
        tone: "warning",
        class: "bg-warning text-warning-foreground hover:bg-warning-hover",
      },
      // neutral solid 走「反色」而不是灰底：灰底实心与 outline 几乎不可分辨，而反色是
      // 明确的「次主操作」。hover 落到 muted，两个主题都朝对比更弱的方向走一步。
      { variant: "solid", tone: "neutral", class: "bg-foreground text-bg hover:bg-muted" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "outline", tone: "success", class: "border-success text-success" },
      { variant: "outline", tone: "warning", class: "border-warning text-warning" },
      // outline / ghost 的 neutral 就是各自的中性形态本身，无需追加类。
      { variant: "ghost", tone: "danger", class: "text-danger" },
      { variant: "ghost", tone: "success", class: "text-success" },
      { variant: "ghost", tone: "warning", class: "text-warning" },
      // link：去掉 size 档的固定高度与横向内边距，回归纯文字链接（不影响行高，文字左缘对齐表头）。
      { variant: "link", class: "h-auto px-0" },
      { variant: "link", tone: "danger", class: "text-danger" },
      { variant: "link", tone: "success", class: "text-success" },
      { variant: "link", tone: "warning", class: "text-warning" },
      { variant: "link", tone: "neutral", class: "text-foreground" },
    ],
    defaultVariants: { variant: "solid", tone: "brand", size: "md" },
  },
);

export { BUTTON_BASE_CLASS, BUTTON_SIZE_CLASS };

const ButtonImpl = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, tone, size, block, loading, disabled, children, render, ...props }, ref) => {
    const isDisabled = disabled || loading;
    const content = (
      <>
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children ?? (render?.props as { children?: ReactNode } | undefined)?.children}
      </>
    );

    // render：渲染为自定义元素（<a>/<Link>）。:disabled 伪类只对表单元素有效，故非 button
    // 用 aria-disabled + 显式 pointer-events/opacity 表达禁用；不套 motion（无 press 缩放）。
    if (render) {
      const renderProps = render.props as Record<string, unknown>;
      return cloneElement(
        render,
        {
          ...props,
          ref,
          className: cn(
            buttonVariants({ variant, tone, size, block }),
            isDisabled && "pointer-events-none opacity-50",
            className,
            renderProps.className as string | undefined,
          ),
          "aria-disabled": isDisabled || undefined,
          "data-disabled": isDisabled ? "" : undefined,
        } as Record<string, unknown>,
        content,
      );
    }

    return (
      // 减包：m + LazyMotionProvider(domAnimation) 取代全量 motion
      <LazyMotionProvider>
        <m.button
          ref={ref}
          className={cn(buttonVariants({ variant, tone, size, block }), className)}
          disabled={isDisabled}
          // press 反馈走 motion 的 transform scale，与 CSS 的颜色过渡互不干扰；禁用态不缩放
          whileTap={isDisabled ? undefined : pressable.whileTap}
          transition={pressable.transition}
          {...(props as HTMLMotionProps<"button">)}
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {children}
        </m.button>
      </LazyMotionProvider>
    );
  },
);
ButtonImpl.displayName = "Button";

export const Button = memo(ButtonImpl);
Button.displayName = "Button";
