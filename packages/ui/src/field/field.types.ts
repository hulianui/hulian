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
  /**
   * 追加到 label 上（与默认的 `text-sm font-medium text-foreground` 经 twMerge 合并，
   * 同族类会顶掉默认值，如传 `text-xs` 即 12px）。
   *
   * 为什么需要它：存量页面的字段排版往往整页统一（12px / muted / 右对齐之类），
   * 而 Field 内部三段此前是硬编码的 —— 对不齐就只能整页退回手搓 label，连带丢掉
   * `aria-describedby` 串联、`invalid` 联动、错误渲染（#153）。
   */
  labelClassName?: string;
  /** 追加到 description 上（默认 `text-xs text-muted-foreground`）。 */
  descriptionClassName?: string;
  /** 追加到 error 上（默认 `text-xs text-danger`）。 */
  errorClassName?: string;
  children: ReactNode; // 控件：hulian Input / Textarea（= Field.Control）
}
