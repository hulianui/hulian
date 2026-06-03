export interface InputOTPProps {
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
  /** 中间分隔点（如 3-3 分组视觉）。 */
  groupGap?: boolean;
  className?: string;
  "aria-label"?: string;
}
