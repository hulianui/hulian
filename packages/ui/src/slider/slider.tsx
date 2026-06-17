"use client";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "../lib/cn";
import type { SliderProps } from "./slider.types";

// thumb 皮肤：焦点环用 has-[:focus-visible]:（焦点在 thumb 内嵌 input，非 thumb div）。
// 几何（位置）由 Base UI 自算 inline style，这里只给外观。
const thumbCls = cn(
  "size-4 rounded-full border border-border bg-surface shadow outline-none transition-transform",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
);

export function Slider({ className, showValue, ...props }: SliderProps) {
  const current = props.value ?? props.defaultValue;
  const isRange = Array.isArray(current);

  return (
    <BaseSlider.Root
      {...props}
      className={cn(
        "w-full select-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className,
      )}
    >
      {showValue && (
        <div className="mb-2 flex items-center justify-end text-sm text-foreground">
          <BaseSlider.Value className="tabular-nums text-muted" />
        </div>
      )}
      <BaseSlider.Control className="relative flex w-full touch-none items-center py-2">
        <BaseSlider.Track className="relative h-1.5 w-full rounded-full bg-surface-hover">
          <BaseSlider.Indicator className="rounded-full bg-primary" />
          {isRange ? (
            <>
              <BaseSlider.Thumb index={0} className={thumbCls} />
              <BaseSlider.Thumb index={1} className={thumbCls} />
            </>
          ) : (
            <BaseSlider.Thumb className={thumbCls} />
          )}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
