import type { ReactNode } from "react";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** 第三态：半选（Base UI 原生 indeterminate）。 */
  indeterminate?: boolean;
  /** 瑚琏收敛签名（丢 Base UI 的 eventDetails，同 Switch 风格）。 */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  /** 可选 inline label（盒右，<label> 原生关联）。 */
  label?: ReactNode;
  /** 落在盒子 Checkbox.Root。 */
  className?: string;
  /** 透传到 Checkbox.Root（树等场景置 -1 退出 Tab 序，焦点由容器 roving 接管）。 */
  tabIndex?: number;
  "aria-label"?: string;
}
