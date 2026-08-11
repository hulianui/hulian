"use client";
import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "../lib/cn";
import { labelClass } from "../label/label";
import type { FieldProps } from "./field.types";

export function Field({
  label,
  description,
  error,
  invalid,
  disabled,
  name,
  orientation = "vertical",
  colSpan,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  children,
}: FieldProps) {
  const isInvalid = invalid ?? Boolean(error); // error 非空隐含 invalid
  const horizontal = orientation === "horizontal";

  // 三段各留一个 className 出口(#153)：走 cn=twMerge，消费方传 text-xs 能顶掉默认的 text-sm，
  // 因此存量页面的排版规矩可以照搬，不必为了对齐字号而整页退回手搓 label —— 那样会连
  // aria-describedby 串联、invalid 联动、错误渲染一起丢掉。
  // label 的皮肤取自 labelClass（与独立 Label 同一份），这里不写字面量，否则两种标签必然分叉。
  const labelNode = label ? (
    <BaseField.Label className={cn(labelClass, labelClassName)}>{label}</BaseField.Label>
  ) : null;

  const descriptionNode = description ? (
    <BaseField.Description className={cn("text-xs text-muted-foreground", descriptionClassName)}>
      {description}
    </BaseField.Description>
  ) : null;

  // match={true} 强制渲染(规避 validityData 恒 null 的静默失效) + 自动串 aria-describedby。
  // 横排时错误独占整行：col-span-full 而不是 col-span-2 —— 消费方顶掉默认列模板换成三列时，
  // 写死的 2 会让错误行只盖住前两列。
  const errorNode = error ? (
    <BaseField.Error
      match={true}
      className={cn("text-xs text-danger", horizontal && "col-span-full", errorClassName)}
    >
      {error}
    </BaseField.Error>
  ) : null;

  return (
    <BaseField.Root
      name={name}
      invalid={isInvalid}
      disabled={disabled}
      className={cn(
        // 横排用 grid 而不是 justify-between：两列一旦是真实轨道，「固定宽度的标签列」就只是
        // 消费方传一个 grid-cols-[8rem_1fr] 顶掉默认值的事（走 twMerge），不必再开一个 prop。
        horizontal
          ? "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5"
          : "flex flex-col gap-1.5",
        colSpan === "full" && "col-span-full",
        className,
      )}
    >
      {horizontal ? (
        <>
          {/* 标签区整体占第一列：label 与 description 竖排，控件与整块垂直居中。
              两者都缺时这个空 div 仍占住第一列，控件因此稳定贴右边缘。 */}
          <div className="flex min-w-0 flex-col gap-1">
            {labelNode}
            {descriptionNode}
          </div>
          <div className="min-w-0">{children}</div>
          {errorNode}
        </>
      ) : (
        <>
          {labelNode}
          {children}
          {descriptionNode}
          {errorNode}
        </>
      )}
    </BaseField.Root>
  );
}
