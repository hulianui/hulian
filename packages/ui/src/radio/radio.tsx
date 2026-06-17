"use client";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { cn } from "../lib/cn";
import type { RadioGroupProps, RadioProps } from "./radio.types";

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <BaseRadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(v as string) : undefined}
      {...props}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row flex-wrap gap-x-5 gap-y-2.5" : "flex-col gap-2.5",
        className,
      )}
    >
      {children}
    </BaseRadioGroup>
  );
}

// 圈皮肤：复用 Switch 配方。disabled 用 data-[disabled]（Root 是 span）。
const dotClass = cn(
  "size-5 shrink-0 grid place-items-center rounded-full border border-border bg-surface transition-colors outline-none",
  "data-[checked]:border-primary",
  "data-[invalid]:border-danger",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

export function Radio({ value, disabled, label, id, className }: RadioProps) {
  const dot = (
    <BaseRadio.Root value={value} disabled={disabled} id={id} className={cn(dotClass, className)}>
      <BaseRadio.Indicator data-icon="dot" className="size-2.5 rounded-full bg-primary" />
    </BaseRadio.Root>
  );

  if (!label) return dot;

  return (
    <label className="inline-flex items-center gap-2">
      {dot}
      <span className={cn("text-sm text-foreground select-none", disabled && "opacity-50")}>{label}</span>
    </label>
  );
}
