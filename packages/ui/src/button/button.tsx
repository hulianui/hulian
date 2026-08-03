"use client";
import { cloneElement, forwardRef, memo, type ReactNode } from "react";
import { type HTMLMotionProps } from "motion/react";
import { cva } from "class-variance-authority";
import { Loader2 } from "../_icons";
import { cn } from "../lib/cn";
import { pressable, LazyMotionProvider, m } from "../motion";
import type { ButtonProps } from "./button.types";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow",
        outline: "border border-hairline bg-surface text-foreground shadow-sm hover:bg-surface-hover",
        ghost: "text-foreground hover:bg-surface-hover",
        // 文字链接按钮：零横向内边距，文字直接贴单元格/容器左缘，用于表格行内操作（查看/编辑）等。
        link: "text-primary underline-offset-4 hover:underline",
      },
      tone: { brand: "", danger: "" },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        // 纯图标方形按钮（无文字内边距）：免去消费方手贴 size-9 px-0 之类补丁。
        icon: "size-9 p-0",
        // 紧凑图标按钮（对齐 sm 档高度 32px，用于 AI 工具栏/输入区等密集场景）。
        iconSm: "size-8 p-0",
      },
    },
    compoundVariants: [
      { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground hover:bg-danger" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "ghost", tone: "danger", class: "text-danger" },
      // link：去掉 size 档的固定高度与横向内边距，回归纯文字链接（不影响行高，文字左缘对齐表头）。
      { variant: "link", class: "h-auto px-0" },
      { variant: "link", tone: "danger", class: "text-danger" },
    ],
    defaultVariants: { variant: "solid", tone: "brand", size: "md" },
  },
);

const ButtonImpl = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, tone, size, loading, disabled, children, render, ...props }, ref) => {
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
            buttonVariants({ variant, tone, size }),
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
          className={cn(buttonVariants({ variant, tone, size }), className)}
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
