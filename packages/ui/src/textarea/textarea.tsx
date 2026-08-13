"use client";
import { forwardRef, useLayoutEffect, useRef } from "react";
import type { InputEvent } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
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

// 按类名边界切词，不能用裸 includes：本档自己发出的那个「不许拖」的类里也含 resize 这个词，
// 用 includes 会把与本档意图一致的写法也点名。可选的 `x:` 前缀段吃掉响应式/状态变体，
// 尾部的边界断言把「不许拖」那一档挡在外面（它后面接的不是空白也不是串尾）。
const RESIZE_OVERRIDE = /(?:^|\s)(?:[\w-]+:)*!?resize(?:-x|-y)?!?(?=\s|$)/;

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

  // 这一档的尾巴（见下）把两个不同 CSS 属性拼在一起，而它们在 tailwind-merge 里分属不同组：
  // 消费方的覆盖只顶得掉管拖拽的那半边，管溢出的那半边原样留下 —— 拿到的是一个拖得动、
  // 但拖小了内容直接被裁且不出滚动条的框，而且**看上去覆盖成功了**。半覆盖比完全无效更难查
  // （完全无效至少现象一致），所以照 button.tsx 的先例开发期点名（#253）。
  // key 按档分而不是共用一个：两条路各有各的出口（一条换档、一条别传那个 prop），
  // 而消费方通常只在其中一档上踩到 —— 共用 key 会让后遇到的那一档静默。
  if ((autoResize || variant === "cell") && className && RESIZE_OVERRIDE.test(className)) {
    warnOnce(
      variant === "cell"
        ? "textarea-resize-override-on-cell"
        : "textarea-resize-override-on-auto-resize",
      `[hulian] Textarea: variant="cell" / autoResize 这一档的高度由内容决定，className 里的 ` +
        `resize-x / resize-y / resize 只顶得掉 resize-none，同一条规则里的 overflow-hidden 不会跟着被覆盖` +
        `——手柄能拖，但往小拖时内容被裁且不出滚动条。要一个可拖的框请改用 variant="default" 且不要传 autoResize。`,
    );
  }

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
          // null 当空串（#220，同 Input）：`register().value` 会把「显式清空」的 null 原样给出来，
          // 而原生 `<textarea value={null}>` 会被 React 判成非受控并打告警。
          // 只映射 null，undefined 保持非受控。
          value={props.value === null ? "" : props.value}
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
