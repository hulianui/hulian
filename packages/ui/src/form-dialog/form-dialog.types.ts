import type { ReactElement, ReactNode } from "react";
import type { FormInstance, FormValues } from "../form/use-form";
import type { DrawerSide } from "../drawer/drawer.types";

export interface FormDialogBaseProps {
  /** 受控开关。 */
  open?: boolean;
  /** 非受控初始开关。 */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 触发元素（非受控打开）。受控时可省。 */
  trigger?: ReactElement;
  /** 标题（a11y label）。 */
  title: string;
  /** 可选 useForm 实例：提供则提交前自动 validate()，校验不过保持打开。 */
  form?: FormInstance;
  /**
   * 提交回调，拿到 values（有 form 时为校验后 values）。
   * 返回 Promise → 提交按钮 loading；resolve(非 false) 自动关闭；reject 或返回 false 保持打开。
   */
  onFinish?: (values: FormValues) => void | boolean | Promise<void | boolean>;
  /** 提交按钮文案（默认走 locale.modalForm.submit）。 */
  submitText?: string;
  /** 取消按钮文案（默认走 locale.modalForm.cancel）。 */
  cancelText?: string;
  /** 容器 className（宽度等）。 */
  className?: string;
  children?: ReactNode;
}

export type ModalFormProps = FormDialogBaseProps;

export interface DrawerFormProps extends FormDialogBaseProps {
  /** 抽屉贴边方向，默认 right。 */
  side?: DrawerSide;
}
