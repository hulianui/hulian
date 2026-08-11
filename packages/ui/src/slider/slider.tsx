"use client";
import { memo } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "../lib/cn";
import type { SliderProps } from "./slider.types";

// thumb 皮肤：焦点环用 has-[:focus-visible]:（焦点在 thumb 内嵌 input，非 thumb div）。
// 几何（位置）由 Base UI 自算 inline style，这里只给外观。
const thumbCls = cn(
  "size-4 rounded-full border border-border bg-surface shadow outline-none transition-transform",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
);

function SliderImpl({ className, showValue, thumbAriaLabel, ...props }: SliderProps) {
  const current = props.value ?? props.defaultValue;
  const isRange = Array.isArray(current);

  // Root 渲染出来是 role="group"，而真正被 Tab 聚焦、被读屏当作滑块播报的是 thumb 里那个
  // 视觉隐藏的 <input type="range">。名字只挂在 Root 上时，读屏进组念一次组名，焦点落到滑块
  // 上却播报「滑块，100」——控件本身没有名字（#200）。Base UI 的 Thumb 会把 aria-label 转到
  // 内部 input 上，所以名字要往下走一层。
  //
  // 单值滑块是**转移**而不是复制：group 里只有一个控件时组名没有信息增量，两处同名会让读屏
  // 把同一句话念两遍，也让「按名字找控件」变成歧义（这正是原生 <input type="range"> + <label>
  // 的形态——名字只在控件上）。range 才保留组名，因为那时组里确实有两个控件。
  const rootLabel = props["aria-label"];
  const rootLabelledBy = props["aria-labelledby"];
  const nameMovesToThumb = !isRange;
  const thumbA11y = (index: 0 | 1) => {
    const label = Array.isArray(thumbAriaLabel) ? thumbAriaLabel[index] : thumbAriaLabel ?? rootLabel;
    if (label != null) return { "aria-label": label };
    // 名字由页面上的可见文本承担时，把同一份 labelledby 指过去。
    return rootLabelledBy != null ? { "aria-labelledby": rootLabelledBy } : {};
  };

  return (
    <BaseSlider.Root
      {...props}
      aria-label={nameMovesToThumb ? undefined : rootLabel}
      aria-labelledby={nameMovesToThumb ? undefined : rootLabelledBy}
      className={cn(
        "w-full select-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className,
      )}
    >
      {showValue && (
        <div className="mb-2 flex items-center justify-end text-sm text-foreground">
          <BaseSlider.Value className="tabular-nums text-muted-foreground" />
        </div>
      )}
      <BaseSlider.Control className="relative flex w-full touch-none items-center py-2">
        <BaseSlider.Track className="relative h-1.5 w-full rounded-full bg-surface-hover">
          <BaseSlider.Indicator className="rounded-full bg-primary" />
          {isRange ? (
            <>
              <BaseSlider.Thumb index={0} className={thumbCls} {...thumbA11y(0)} />
              <BaseSlider.Thumb index={1} className={thumbCls} {...thumbA11y(1)} />
            </>
          ) : (
            <BaseSlider.Thumb className={thumbCls} {...thumbA11y(0)} />
          )}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
SliderImpl.displayName = "Slider";

// 滑块常成组落在筛选面板/设置页里，父级一动就整组重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Slider = memo(SliderImpl);
Slider.displayName = "Slider";
