import type { HTMLAttributes } from "react";

/**
 * 继承根节点（`role="group"` 的 div）原生属性，因此 `id` / `data-*` / `aria-*` /
 * `onFocus` / `onBlur` 这些都能直接传（#157）。
 *
 * 为什么这条对表单件是**验收项**而不是锦上添花：InputOTP 的值是整串而非原生 input，
 * 接 react-hook-form 只能走 `Controller`，而 `Controller` 会给你 `field.onBlur` ——
 * 传不进去的话 `touchedFields` 永不更新，`mode: "onBlur"` / `"onTouched"` 的表单
 * **静默失效**（点进点出不校验，只有提交才报错），排查起来极难。
 *
 * 去掉的两个：`onChange` 与原生签名冲突（这里回吐的是整串字符串而非事件），
 * `children` 由槽位自行渲染、外部塞不进来。
 */
export interface InputOTPProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  /** 分段数量（默认 6）。 */
  length?: number;
  /** 受控值。 */
  value?: string;
  /** 非受控初始值。 */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 填满时回调。 */
  onComplete?: (value: string) => void;
  /** 仅数字（默认）或任意字符。 */
  type?: "numeric" | "text";
  disabled?: boolean;
  /** 校验失败态。 */
  invalid?: boolean;
  /** 中间插入横线分隔符（3-3 分组视觉，如 XXX–XXX）。 */
  groupGap?: boolean;
  /**
   * 提交标识。槽位是 N 个各含一位的 input，同名提交会得到 N 个字段，
   * 所以这里额外渲染一个持有**完整值**的隐藏 input 挂 name —— 原生 `<form>` 提交
   * 与 FormData 拿到的都是整串验证码。
   */
  name?: string;
  className?: string;
  "aria-label"?: string;
}
