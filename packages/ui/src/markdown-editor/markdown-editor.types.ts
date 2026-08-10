import type { HTMLAttributes } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface MarkdownEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 受控 markdown 字符串 */
  value?: string;
  /** 非受控初值 */
  defaultValue?: string;
  /** 内容变化回调，参数为 markdown 字符串 */
  onChange?: (markdown: string) => void;
  /** 桥给原生表单 / Field 的隐藏 input name */
  name?: string;
  placeholder?: string;
  /** 校验失败态：外壳变 danger（也可由外层 Field 经 data-invalid 驱动） */
  invalid?: boolean;
  disabled?: boolean;
  /** 内容区最小高度（行），默认 6 */
  minRows?: number;
  className?: string;
  "aria-label"?: string;
}
