"use client";
import { useLayoutEffect, useRef } from "react";
import type { InputEvent } from "react";
import { Field as BaseField } from "@base-ui-components/react/field";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { TextareaProps } from "./textarea.types";

export const textareaVariants = cva(
  [
    "w-full rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "outline-none placeholder:text-muted",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-sm",
        md: "px-3 py-2 text-sm",
        lg: "px-3.5 py-2.5 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function Textarea({
  className,
  size,
  invalid,
  autoResize,
  rows = 3,
  onInput,
  ...props
}: TextareaProps) {
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
          ref={ref}
          rows={rows}
          onInput={handleInput}
          {...props}
          {...(invalid && { "data-invalid": "", "aria-invalid": true })}
          className={cn(
            textareaVariants({ size }),
            autoResize ? "resize-none overflow-hidden" : "resize-y",
            className,
          )}
        />
      }
    />
  );
}
