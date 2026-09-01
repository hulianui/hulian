"use client";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "../lib/cn";
import { LabelledGroupContext, useNeedsFieldItem } from "../lib/labelled-group-context";
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
      <LabelledGroupContext.Provider value={true}>{children}</LabelledGroupContext.Provider>
    </BaseRadioGroup>
  );
}

// 圈皮肤：复用 Switch 配方。disabled 用 data-[disabled]（Root 是 span）。
const dotClass = cn(
  "shrink-0 grid place-items-center rounded-full border border-border bg-surface transition-colors outline-none",
  "data-[checked]:border-primary",
  "data-[invalid]:border-danger",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

// 尺寸档与 Checkbox 同构（#199）：圈与内点一起缩放，否则圈压到 16px 时内点占比失衡。
const ringSizeClass = { sm: "size-4", md: "size-5" } as const;
const innerDotSizeClass = { sm: "size-2", md: "size-2.5" } as const;
const labelSizeClass = { sm: "text-xs", md: "text-sm" } as const;

export function Radio({
  value,
  disabled,
  label,
  children,
  id,
  className,
  size = "md",
  labelClassName,
  ...a11y
}: RadioProps) {
  // children 与 label 等价（#183）：`<Radio value="1">审核通过</Radio>` 是 el-radio / antd Radio
  // 迁过来的恒定写法，也是 React 生态直觉。此前 children 既没被解构、又被 Root 上显式的
  // Indicator 子节点盖掉，结果是「类型放行、运行时什么都不渲染」——三道门禁全绿，只能靠肉眼截图发现。
  const text = label ?? children;
  const inGroup = useNeedsFieldItem();
  const dot = (
    // a11y（aria-label / aria-labelledby / aria-describedby）必须落到 Root：它才是 role=radio 的宿主。
    // 无 label 用法此前完全拿不到无障碍名 —— 读屏只报「单选按钮」，不知道选的是哪一项。
    <BaseRadio.Root
      value={value}
      disabled={disabled}
      id={id}
      {...a11y}
      className={cn(dotClass, ringSizeClass[size], className)}
    >
      <BaseRadio.Indicator
        data-icon="dot"
        className={cn(innerDotSizeClass[size], "rounded-full bg-primary")}
      />
    </BaseRadio.Root>
  );

  if (text == null || text === false || text === "") return dot;

  const labelText = (
    <span className={cn(labelSizeClass[size], "text-foreground select-none", disabled && "opacity-50", labelClassName)}>
      {text}
    </span>
  );
  // 组内：Field.Item 给这一项独立的标签作用域（见 lib/labelled-group-context.ts）。render 成 <label> 本身，DOM 层级不变。
  if (inGroup) {
    return (
      <BaseField.Item render={<label className="inline-flex items-center gap-2" />}>
        {dot}
        {labelText}
      </BaseField.Item>
    );
  }
  return (
    <label className="inline-flex items-center gap-2">
      {dot}
      {labelText}
    </label>
  );
}
