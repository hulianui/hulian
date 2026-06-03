export interface NumberFieldProps {
  /** 受控值（null=空）。 */
  value?: number | null;
  /** 非受控初始值。 */
  defaultValue?: number;
  /** 瑚琏收敛签名（丢 Base UI eventDetails）。 */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** 步进量，默认 1。 */
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
}
