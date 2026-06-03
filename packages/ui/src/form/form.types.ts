import type { ReactNode } from "react";

export interface FormProps {
  /** 校验时机：onSubmit(默认) / onBlur / onChange。 */
  validationMode?: "onSubmit" | "onBlur" | "onChange";
  /** 外部/服务端校验错误，按 `<Field name>` 映射（展示需 Field 内有 Field.Error）。 */
  errors?: Record<string, string | string[]>;
  /** 提交时拿到结构化 values（已 preventDefault 原生提交）。 */
  onFormSubmit?: (formValues: Record<string, unknown>) => void;
  className?: string;
  children?: ReactNode;
}
