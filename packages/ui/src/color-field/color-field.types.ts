import type { InputHTMLAttributes } from "react";

export interface ColorFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "prefix" | "value" | "defaultValue" | "onChange" | "type"
  > {
  /** 受控值。接受 `#rgb` / `#rrggbb` / 无 `#` 的写法，内部统一规范为小写 `#rrggbb`。 */
  value?: string;
  /** 非受控初值。 */
  defaultValue?: string;
  /** 值变化回调，参数恒为规范化后的 `#rrggbb`（输入不合法时不触发）。 */
  onValueChange?: (hex: string) => void;
  /** 左侧色块（点开调起系统取色器）。 */
  showSwatch?: boolean;
  size?: "sm" | "md" | "lg";
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动，无需重复传。 */
  invalid?: boolean;
}
