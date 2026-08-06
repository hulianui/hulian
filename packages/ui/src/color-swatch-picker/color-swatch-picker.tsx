"use client";
import { memo } from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import type { ColorSwatchPickerProps, SwatchSize } from "./color-swatch-picker.types";
import { normalizeSwatches } from "./swatch-items";

// 离散预设色块单选网格：HeroUI ColorSwatchPicker 的零依赖对标。
// 复用 base-ui RadioGroup 拿到 roving-tabindex + 键盘方向键 a11y，换皮成色块。
const SIZE: Record<SwatchSize, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
};

function ColorSwatchPickerImpl({
  colors,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: ColorSwatchPickerProps) {
  const labels = useComponentLocale().colorSwatchPicker ?? { label: "颜色色板" };
  // 色值是身份、label 只是名字：归一化后 color 仍原样进 value/onValueChange。
  const swatches = normalizeSwatches(colors);
  return (
    <BaseRadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(v as string) : undefined}
      disabled={disabled}
      aria-label={ariaLabel ?? labels.label}
      className={cn("flex flex-wrap gap-2", disabled && "opacity-50", className)}
    >
      {swatches.map(({ color, label }) => (
        <BaseRadio.Root
          key={color}
          value={color}
          aria-label={label}
          title={label}
          style={{ backgroundColor: color }}
          className={cn(
            SIZE[size],
            "grid place-items-center rounded-[min(var(--radius),0.5rem)] border border-border transition-[box-shadow,transform] outline-none",
            // 选中：token 主色 ring 描边 + 轻微放大
            "data-[checked]:scale-105 data-[checked]:ring-2 data-[checked]:ring-primary data-[checked]:ring-offset-2 data-[checked]:ring-offset-bg",
            "hover:scale-105",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            "data-[disabled]:cursor-not-allowed data-[disabled]:hover:scale-100",
          )}
        >
          {/* 勾：mix-blend-difference 白勾 → 永远与底色反相，深浅色块都可见 */}
          <BaseRadio.Indicator>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 mix-blend-difference"
              aria-hidden
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </BaseRadio.Indicator>
        </BaseRadio.Root>
      ))}
    </BaseRadioGroup>
  );
}

export const ColorSwatchPicker = memo(ColorSwatchPickerImpl);
ColorSwatchPicker.displayName = "ColorSwatchPicker";
