"use client";
import { cn } from "../lib/cn";
import type { LabelProps } from "./label.types";

/**
 * 表单标签皮肤的唯一真源：Field 的 label 段与独立 Label 共用这一份。
 *
 * 为什么要抽出来：两处各写一份字面量的话，改字号/字重时只会改到一处，而消费方的同一个页面里
 * 「Field 出的标签」和「手写的标签」是并存的 —— 分叉当场可见（#161）。
 * 也导出给消费方：需要把标签皮肤贴到别的元素上（如 fieldset 的 legend）时用它，别抄字面量。
 */
export const labelClass = "text-sm font-medium text-foreground";

/**
 * 表单标签原语：一个 `<label>` + 与 Field.Label 完全一致的皮肤。
 *
 * 用于「已有排版、进不去 Field」的场景 —— 典型是设置页的一行一项（左标签右控件）。
 * 需要 label/help/error 三段与 a11y 自动串联时用 [Field]（横排见 `orientation="horizontal"`）。
 */
export function Label({ className, children, ...rest }: LabelProps) {
  // rest 展开在最前面：组件自身的 className 经 twMerge 合并后落在后面，
  // 消费方传 `text-xs` 能顶掉默认字号，与 Field 的 labelClassName 出口口径一致。
  return (
    <label {...rest} className={cn(labelClass, className)}>
      {children}
    </label>
  );
}
