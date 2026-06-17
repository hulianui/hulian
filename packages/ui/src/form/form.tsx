"use client";
import { Form as BaseForm } from "@base-ui/react/form";
import { cn } from "../lib/cn";
import type { FormProps } from "./form.types";

// 极薄容器：默认纵向间距 space-y-4 + 与瑚琏 Field 协同（errors 按 name、onFormSubmit 拿结构化 values）。
export function Form({ className, errors, onFormSubmit, validationMode, children }: FormProps) {
  return (
    <BaseForm
      validationMode={validationMode}
      errors={errors}
      onFormSubmit={onFormSubmit ? (values) => onFormSubmit(values as Record<string, unknown>) : undefined}
      className={cn("space-y-4", className)}
    >
      {children}
    </BaseForm>
  );
}
