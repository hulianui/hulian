import type { ReactNode } from "react";

export interface FieldProps {
  label?: ReactNode;
  description?: ReactNode; // help 文案
  error?: ReactNode; // 非空隐含 invalid，并强制渲染错误
  invalid?: boolean; // 显式覆盖；缺省时由 error 是否非空推导
  disabled?: boolean;
  /** 提交标识，透传 Field.Root（YAGNI 逃生口；validate/validationMode 本批不暴露）。 */
  name?: string;
  /** 在 ProForm columns 栅格中跨整行（占满所有列）；栅格外无副作用。 */
  colSpan?: "full";
  className?: string; // 落在 Field.Root（纵向布局容器）
  children: ReactNode; // 控件：hulian Input / Textarea（= Field.Control）
}
