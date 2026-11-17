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
  shape = "square",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...rest
}: ColorSwatchPickerProps) {
  const labels = useComponentLocale().colorSwatchPicker ?? { label: "颜色色板" };
  // 色值是身份、label 只是名字：归一化后 color 仍原样进 value/onValueChange。
  const swatches = normalizeSwatches(colors);
  return (
    <BaseRadioGroup
      {...rest}
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
            "grid place-items-center transition-[box-shadow,transform,outline-color] outline-none",
            // square：token 圆角 + 实线细边。circle：全圆、不画边，只留一圈极淡的内阴影把浅色块
            // 从白底上勾出来 —— 圆色块加实线边会显得像按钮，配色器里要的是「一滴颜料」。
            shape === "circle"
              ? "rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]"
              : "rounded-[min(var(--radius),0.5rem)] border border-border",
            // 选中：主色外环 + 轻微放大。外环用 outline + outline-offset 而不是 ring + ring-offset：
            // ring-offset 的间隙是**画出来的**（固定取 bg 色），放在卡片里会露出一圈与卡面不同的底色；
            // outline-offset 的间隙是透明的，放在哪个面上都透出那个面本身。
            "data-[checked]:scale-105 data-[checked]:outline-2 data-[checked]:outline-solid data-[checked]:outline-offset-2 data-[checked]:outline-primary",
            "hover:scale-105",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            "data-[disabled]:cursor-not-allowed data-[disabled]:hover:scale-100",
          )}
        >
          {/* 勾：纯白描边 + 一圈很淡的深色描影。白勾压在饱和色、深色上清楚，压在浅色上靠描影立住。
              之前用 mix-blend-difference 取反相：可读是可读，但颜色是底色的补色 —— 蓝底出橙勾、
              绿底出粉勾，选中态看着像出错了。 */}
          <BaseRadio.Indicator>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 [filter:drop-shadow(0_0_1.5px_rgb(0_0_0/0.55))]"
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
