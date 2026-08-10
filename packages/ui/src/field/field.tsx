"use client";
import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "../lib/cn";
import type { FieldProps } from "./field.types";

export function Field({
  label,
  description,
  error,
  invalid,
  disabled,
  name,
  colSpan,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  children,
}: FieldProps) {
  const isInvalid = invalid ?? Boolean(error); // error 非空隐含 invalid

  return (
    <BaseField.Root
      name={name}
      invalid={isInvalid}
      disabled={disabled}
      className={cn("flex flex-col gap-1.5", colSpan === "full" && "col-span-full", className)}
    >
      {/* 三段各留一个 className 出口(#153)：走 cn=twMerge，消费方传 text-xs 能顶掉默认的
          text-sm，因此存量页面的排版规矩可以照搬，不必为了对齐字号而整页退回手搓 label
          —— 那样会连 aria-describedby 串联、invalid 联动、错误渲染一起丢掉。 */}
      {label && (
        <BaseField.Label className={cn("text-sm font-medium text-foreground", labelClassName)}>
          {label}
        </BaseField.Label>
      )}
      {children}
      {description && (
        <BaseField.Description className={cn("text-xs text-muted-foreground", descriptionClassName)}>
          {description}
        </BaseField.Description>
      )}
      {/* match={true} 强制渲染(规避 validityData 恒 null 的静默失效) + 自动串 aria-describedby */}
      {error && (
        <BaseField.Error match={true} className={cn("text-xs text-danger", errorClassName)}>
          {error}
        </BaseField.Error>
      )}
    </BaseField.Root>
  );
}
