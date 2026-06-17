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
      {label && (
        <BaseField.Label className="text-sm font-medium text-foreground">{label}</BaseField.Label>
      )}
      {children}
      {description && (
        <BaseField.Description className="text-xs text-muted">{description}</BaseField.Description>
      )}
      {/* match={true} 强制渲染(规避 validityData 恒 null 的静默失效) + 自动串 aria-describedby */}
      {error && (
        <BaseField.Error match={true} className="text-xs text-danger">
          {error}
        </BaseField.Error>
      )}
    </BaseField.Root>
  );
}
