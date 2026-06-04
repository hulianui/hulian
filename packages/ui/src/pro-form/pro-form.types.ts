import type { ReactNode } from "react";
import type { FormInstance, FormValues } from "../form/use-form";

export interface ProFormProps {
  /** useForm 实例：提供则提交前自动 validate()，重置走 form.resetFields()。 */
  form?: FormInstance;
  /**
   * 提交回调，拿到 values（有 form 时为校验后 values）。
   * 返回 Promise → 提交按钮 loading；reject 不抛断（错误反馈交消费者）。
   */
  onFinish?: (values: FormValues) => void | boolean | Promise<void | boolean>;
  /** 提交按钮文案（默认 locale.proForm.submit）。 */
  submitText?: string;
  /** 重置按钮文案（默认 locale.proForm.reset）。 */
  resetText?: string;
  /** 是否显示重置按钮，默认 true（需 form 才有意义）。 */
  showReset?: boolean;
  /** 底部操作区对齐，默认 left。 */
  footerAlign?: "left" | "right";
  /** 自定义底部操作区（覆盖默认提交/重置按钮）。 */
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}
