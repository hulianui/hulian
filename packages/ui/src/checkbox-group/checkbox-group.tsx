"use client";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { cn } from "../lib/cn";
import { LabelledGroupContext } from "../lib/labelled-group-context";
import type { CheckboxGroupProps } from "./checkbox-group.types";

// 复用瑚琏 Checkbox（子项各带 name）；CheckboxGroup 仅协调值数组 + 下发 disabled。
// parent/全选(allValues) YAGNI 后议。
export function CheckboxGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  orientation = "vertical",
  children,
  "aria-label": ariaLabel,
  ...rest
}: CheckboxGroupProps) {
  return (
    <BaseCheckboxGroup
      {...rest}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(v as string[]) : undefined}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row flex-wrap gap-x-5 gap-y-2.5" : "flex-col gap-2.5",
        className,
      )}
    >
      <LabelledGroupContext.Provider value={true}>{children}</LabelledGroupContext.Provider>
    </BaseCheckboxGroup>
  );
}
