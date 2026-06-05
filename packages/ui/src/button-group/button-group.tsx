"use client";
import { cn } from "../lib/cn";
import type { ButtonGroupProps } from "./button-group.types";

// 按钮组 = 把若干 Button 排成一体（工具栏分段操作 / 主+次动作 / 拆分按钮）。
// 纯布局壳：不接管子按钮的 variant/size（消费方各自传），仅用后代选择器抹内侧圆角、
// 合并相邻边框、给 hover/focus 项抬 z-index 让其完整边框压在相邻项之上。
// attached 模式刻意要求子项 variant 一致（同为 outline 或同为 solid）观感才整齐。
export function ButtonGroup({
  orientation = "horizontal",
  attached = true,
  gap = "sm",
  className,
  children,
  "aria-label": ariaLabel,
}: ButtonGroupProps) {
  const horizontal = orientation === "horizontal";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex",
        horizontal ? "flex-row" : "flex-col",
        // 子项参与 z-index 抬升，需定位上下文
        "[&>*]:relative focus-within:[&>*:focus-visible]:z-10 [&>*:hover]:z-10",
        attached
          ? horizontal
            ? // 横向连排：除首项外左移 1px 合并竖边框；抹内侧左右圆角
              "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none"
            : // 纵向连排：除首项外上移 1px 合并横边框；抹内侧上下圆角
              "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none"
          : horizontal
            ? gap === "sm"
              ? "gap-2"
              : "gap-3"
            : gap === "sm"
              ? "flex-col gap-2"
              : "flex-col gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
