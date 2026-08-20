"use client";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "../lib/cn";
import { labelClass } from "../label/label";
import type { FieldProps } from "./field.types";

export function Field({
  label,
  description,
  error,
  invalid,
  disabled,
  required,
  requiredMark = true,
  name,
  orientation = "vertical",
  colSpan,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  children,
}: FieldProps) {
  const isInvalid = invalid ?? Boolean(error); // error 非空隐含 invalid
  const horizontal = orientation === "horizontal";

  // 三段各留一个 className 出口(#153)：走 cn=twMerge，消费方传 text-xs 能顶掉默认的 text-sm，
  // 因此存量页面的排版规矩可以照搬，不必为了对齐字号而整页退回手搓 label —— 那样会连
  // aria-describedby 串联、invalid 联动、错误渲染一起丢掉。
  // label 的皮肤取自 labelClass（与独立 Label 同一份），这里不写字面量，否则两种标签必然分叉。
  // 必填标记（#180）：走 aria-hidden 的装饰节点，语义由下面落到控件的 aria-required 承担 ——
  // 星号本身读屏读不到，只画星号等于「视力用户知道、读屏用户不知道」，两边必须同时给。
  const requiredMarkNode =
    required && requiredMark !== false ? (
      <span aria-hidden="true" className="mr-0.5 text-danger">
        {requiredMark === true ? "*" : requiredMark}
      </span>
    ) : null;

  // label 收到文字宽（#296）：BaseField.Label 是带 htmlFor 的真 <label>，作为 flex item 被
  // stretch 拉满整行后，行尾那片看不见的空白照样是命中区，点它等于点控件 —— 对浮层型控件
  // （Select / DatePicker / Cascader …）就是「浮层凭空弹开」。w-fit 只收盒子，文字区照常可点，
  // 键盘与读屏路径不变。需要满宽 label 的传 `labelClassName="w-full"` 顶掉（走 twMerge）。
  const labelNode = label ? (
    <BaseField.Label className={cn(labelClass, "w-fit", labelClassName)}>
      {requiredMarkNode}
      {label}
    </BaseField.Label>
  ) : null;

  // aria-required 落到控件本身：消费方够不着 Field 内部的控件节点，自建 RequiredLabel 也补不了。
  // 只在 children 是单个元素时能注入；多子节点 / 文本时不动它（文档里写明此时自己给）。
  // 已显式写了 aria-required 的以消费方为准，不覆盖。
  const control =
    required && isValidElement(children)
      ? (() => {
          const el = children as ReactElement<Record<string, unknown>>;
          return "aria-required" in el.props
            ? children
            : cloneElement(el, { "aria-required": true });
        })()
      : children;

  const descriptionNode = description ? (
    <BaseField.Description className={cn("text-xs text-muted-foreground", descriptionClassName)}>
      {description}
    </BaseField.Description>
  ) : null;

  // match={true} 强制渲染(规避 validityData 恒 null 的静默失效) + 自动串 aria-describedby。
  // 横排时错误独占整行：col-span-full 而不是 col-span-2 —— 消费方顶掉默认列模板换成三列时，
  // 写死的 2 会让错误行只盖住前两列。
  const errorNode = error ? (
    <BaseField.Error
      match={true}
      className={cn("text-xs text-danger", horizontal && "col-span-full", errorClassName)}
    >
      {error}
    </BaseField.Error>
  ) : null;

  return (
    <BaseField.Root
      name={name}
      invalid={isInvalid}
      disabled={disabled}
      className={cn(
        // 横排用 grid 而不是 justify-between：两列一旦是真实轨道，「固定宽度的标签列」就只是
        // 消费方传一个 grid-cols-[8rem_1fr] 顶掉默认值的事（走 twMerge），不必再开一个 prop。
        horizontal
          ? "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5"
          : "flex flex-col gap-1.5",
        colSpan === "full" && "col-span-full",
        className,
      )}
    >
      {horizontal ? (
        <>
          {/* 标签区整体占第一列：label 与 description 竖排，控件与整块垂直居中。
              两者都缺时这个空 div 仍占住第一列，控件因此稳定贴右边缘。 */}
          <div className="flex min-w-0 flex-col gap-1">
            {labelNode}
            {descriptionNode}
          </div>
          <div className="min-w-0">{control}</div>
          {errorNode}
        </>
      ) : (
        <>
          {labelNode}
          {control}
          {descriptionNode}
          {errorNode}
        </>
      )}
    </BaseField.Root>
  );
}
