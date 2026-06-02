import type { ReactNode } from "react";

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  /** 仅控布局，默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export interface RadioProps {
  /** 必填，标识该选项。 */
  value: string;
  disabled?: boolean;
  /** 可选 inline label（点右，<label> 原生关联）。 */
  label?: ReactNode;
  id?: string;
  /** 落在点 Radio.Root。 */
  className?: string;
}
