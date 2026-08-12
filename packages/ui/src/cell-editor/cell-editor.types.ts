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
  /**
   * 提交前校验：返回字符串＝这是错误消息，**拦住 `onCommit`**（值不出去）并在原地把该串显示出来；
   * 返回 `undefined` 即放行。
   *
   * 存在的理由是失焦即提交这条契约本身：没有这一层时非法值会先写进去再由消费方回滚，
   * 而那时光标已经跑到下一格，用户看到的是「我改的东西自己变回去了」。
   *
   * 拦住之后草稿**不回滚**（要让用户看见自己写错的那串继续改），判等基准也不推进 ——
   * 于是下一次 blur 会再校验一次，改对了才提交。Esc 仍然回滚并清掉错误。
   */
  validate?: (next: string) => string | undefined;
  /** 「这个字段还没填」：降成 muted + italic，让「空」和「填了空格」一眼可分。 */
  missing?: boolean;
  /** 多行档（textarea + `field-sizing: content` 自增高）；默认单行 input。 */
  multiline?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
