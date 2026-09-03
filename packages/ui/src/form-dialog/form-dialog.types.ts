import type { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import type { ReactElement, ReactNode } from "react";
import type { FormInstance, FormValues } from "../form/use-form";
import type { DrawerSide } from "../drawer/drawer.types";

/**
 * 开关变化的来龙去脉（Base UI 原样透出）。`reason` 区分 `outside-press` / `escape-key` /
 * `close-press` / `trigger-press`，`cancel()` 可在同步调用栈内否决这次变化。
 */
export type FormDialogChangeDetails = DialogRootChangeEventDetails;

export interface FormDialogBaseProps {
  /** 受控开关。 */
  open?: boolean;
  /** 非受控初始开关。 */
  defaultOpen?: boolean;
  /**
   * 开关变化回调。第二个参数是 Base UI 的事件详情（#343）：`details.reason` 说明这次是
   * 点了遮罩、按了 Esc 还是点了关闭键，`details.cancel()` 能在同步调用栈内否决它。
   * 由触发器打开、或编排件自己提交后关闭时没有详情，第二个参数为 `undefined`。
   */
  onOpenChange?: (open: boolean, details?: FormDialogChangeDetails) => void;
  /**
   * 点遮罩是否关闭。**默认 `false`** —— 与 `Dialog` / `Drawer` 原语相反（#343）。
   *
   * 编排件知道自己装的是一张表单：填到一半时鼠标落在弹窗外一点就全部清空、且没有任何
   * 确认，这个代价与「随手关掉」的便利完全不成比例。要恢复原语的行为传 `true`。
   */
  dismissible?: boolean;
  /**
   * 表单被改动过时，关闭前先确认一次（"还没提交，确定放弃？"）。默认 `true`。
   *
   * **判据来自 `form`**：没有传 `form` 时编排件无从知道内容是否改过，这个开关不起作用
   * （此时只有 `dismissible` 生效）。干净的表单直接关，不会平白多一次确认。
   * 提交成功后的关闭也不确认 —— 那时数据已经交出去了。
   */
  confirmOnClose?: boolean;
  /** 放弃确认的标题，缺省吃 ConfigProvider locale（`modalForm.discardTitle`）。 */
  discardTitle?: ReactNode;
  /** 放弃确认的说明，缺省吃 locale（`modalForm.discardDescription`）。 */
  discardDescription?: ReactNode;
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

export interface ModalFormProps extends FormDialogBaseProps {
  /** 允许按住标题拖动对话框（透传 [DialogContent.draggable](../dialog/dialog.md)）。默认 `false`。 */
  draggable?: boolean;
}

export interface DrawerFormProps extends FormDialogBaseProps {
  /** 抽屉贴边方向，默认 right。 */
  side?: DrawerSide;
}
