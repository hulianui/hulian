import type { InputHTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputShellVariants } from "./input";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix" | "value">,
    VariantProps<typeof inputShellVariants> {
  /**
   * 受控值。除原生类型外还收 `null`，按空串渲染（#220）。
   *
   * `useForm` 的 `register().value` 把「显式清空」的 `null` 原样给出来（塌成 `""` 会让
   * `form.values` 与 binding 两处口径对不上），而原生 `<input value={null}>` 会被 React
   * 判成非受控并打告警——所以由本组件收口。`undefined` 仍是「非受控」，不受影响。
   */
  value?: InputHTMLAttributes<HTMLInputElement>["value"] | null;
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动，无需重复传。 */
  invalid?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
