import type { HTMLAttributes } from "react";

export interface CellEditorProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  /** 已提交值（受控数据源）：提交成功后父级把新值写回这里，组件据此重置内部草稿。 */
  value: string;
  /**
   * blur / Enter 触发。**值与上次提交相同时不会调用** —— 核对场景里用户大量「点进去看一眼
   * 再点走」，不判等会把一整屏空提交打到后端。
   * 返回 Promise 时组件自己进 pending 态并禁用，消费方不必再传 `disabled={saving}`。
   */
  onCommit?: (next: string) => void | Promise<void>;
  /** 「这个字段还没填」：降成 muted + italic，让「空」和「填了空格」一眼可分。 */
  missing?: boolean;
  /** 多行档（textarea + `field-sizing: content` 自增高）；默认单行 input。 */
  multiline?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
