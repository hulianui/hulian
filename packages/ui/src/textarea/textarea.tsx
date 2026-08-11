"use client";
import { forwardRef, useLayoutEffect, useRef } from "react";
import type { InputEvent } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import type { TextareaProps } from "./textarea.types";

export const textareaVariants = cva(
  [
    "w-full text-foreground transition-colors",
    "outline-none placeholder:text-muted-foreground",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      // cell 档的取舍与 Input 同源，见 input.tsx 的注释（#149）。这里多一样：
      // field-sizing-content —— 让高度跟着内容长，rows 退化成「最少几行」的下限，
      // 这是浏览器原生做的，没有 autoResize 那条 useLayoutEffect + 读 scrollHeight 的往返。
      variant: {
        default: [
          "rounded-[var(--radius)] border border-border bg-surface",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
        ],
        cell: [
          "rounded-sm border-0 bg-transparent p-0 field-sizing-content",
          "focus-visible:bg-primary-subtle focus-visible:shadow-[inset_0_-2px_0_0_var(--color-primary)]",
          "data-[invalid]:shadow-[inset_0_-2px_0_0_var(--color-danger)]",
        ],
      },
      size: {
        /** 密集数据表的行内编辑器档，与 Input / SelectTrigger 的 `xs` 等高（#187）。 */
        xs: "text-xs",
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base",
      },
    },
    compoundVariants: [
      { variant: "default", size: "xs", class: "px-2 py-1" },
      { variant: "default", size: "sm", class: "px-2.5 py-1.5" },
      { variant: "default", size: "md", class: "px-3 py-2" },
      { variant: "default", size: "lg", class: "px-3.5 py-2.5" },
    ],
    defaultVariants: { size: "md", variant: "default" },
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    size,
    variant,
    invalid,
    autoResize,
    // 单元格里的默认下限是 1 行：3 行下限会把表格行撑成三倍高，于是每个调用处都得补 rows={1}
    // —— 那正是本变体要消灭的「在调用处打补丁」（#149）。
    rows = variant === "cell" ? 1 : 3,
    onInput,
    ...props
  },
  forwardedRef,
) {
  // 内部 ref 量 scrollHeight（autoResize），消费方 ref 拿同一个节点做 focus()/select()/
  // react-hook-form register()。两者并起来而不是二选一 —— 此前内部占着 ref，消费方直接 TS2322（#186）。
  const ref = useRef<HTMLTextAreaElement>(null);

  // 红线①: 先 height='auto' 再读 scrollHeight（否则删字后高度不回收，只增不减）。
  // rows 属性在 height='auto' 态下决定最小高度 → 天然作下限(红线③)。
  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // 红线②: 受控 value / rows 变化也要重测，不能只听原生事件。useLayoutEffect 避免闪烁。
  useLayoutEffect(() => {
    if (autoResize) resize();
  }, [autoResize, props.value, rows]);

  // 非受控键入路径：原生 input 事件也触发重测。
  const handleInput = (e: InputEvent<HTMLTextAreaElement>) => {
    if (autoResize) resize();
    onInput?.(e);
  };

  // 用 Base UI Field.Control 承载 → 放进 Field 内自动取 id/aria-describedby/aria-invalid 串联
  // (与 Input 对称)。textarea 专属 props(ref/rows/onInput/...props) 走 render 元素(原生 textarea
  // 类型)，绕开 FieldControl ref 绑 HTMLInputElement 的类型约束；独立用时 Field.Control 优雅降级为纯渲染。
  return (
    <BaseField.Control
      render={
        <textarea
          ref={mergeRefs(ref, forwardedRef)}
          rows={rows}
          onInput={handleInput}
          {...props}
          {...(invalid && { "data-invalid": "", "aria-invalid": true })}
          className={cn(
            textareaVariants({ size, variant }),
            // cell 与 autoResize 同样是「高度由内容决定」，留着拖拽手柄等于给用户一个
            // 下一次重测就会被抹掉的操作。两条路都只是把高度交给内容，叠加也不冲突：
            // autoResize 写的是内联 style.height，优先级高于 field-sizing 的固有尺寸，
            // 所以在没有 field-sizing 的浏览器上加 autoResize 就是无缝兜底。
            autoResize || variant === "cell" ? "resize-none overflow-hidden" : "resize-y",
            className,
          )}
        />
      }
    />
  );
});
