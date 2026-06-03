import type { ReactNode, TextareaHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { textareaVariants } from "../textarea/textarea";

/** 单条候选项（@提及目标，如用户/工单/标签）。 */
export interface MentionOption {
  /** 唯一身份键（onSelect 回传、列表 key、默认过滤参与）。 */
  value: string;
  /** 展示名 = 实际插入的文本（插入为 `prefix + label + " "`）。 */
  label: string;
  /** 次级描述（label 下方 muted 小字，如角色/邮箱）。 */
  description?: ReactNode;
  /** 行首插槽（头像/图标）。 */
  startContent?: ReactNode;
  disabled?: boolean;
}

export interface MentionsProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size" | "value" | "defaultValue" | "onChange" | "onSelect" | "prefix"
  > {
  /** 受控文本值（与 onChange 配套）。 */
  value?: string;
  /** 非受控初始值（不传 value 时生效）。 */
  defaultValue?: string;
  /** 文本变化回调（受控必接）。 */
  onChange?: (value: string) => void;
  /** 候选清单。 */
  options: MentionOption[];
  /**
   * 触发符（默认 "@"，可配多字符如 "@@" / "#"）。键入触发符且其前为行首或空白时唤起候选。
   */
  prefix?: string;
  /**
   * 查询变化通知（用于外部/异步过滤——父级据此刷新 options）。本身不返回结果。
   */
  onSearch?: (query: string) => void;
  /**
   * 本地过滤：`false` 关闭（候选 = 原样 options，交给 onSearch 外部过滤）；
   * 传函数自定义；缺省 = 内置大小写不敏感子串匹配（label/value）。
   */
  filter?: false | ((option: MentionOption, query: string) => boolean);
  /** 选中候选回调（回传整条 option）。 */
  onSelect?: (option: MentionOption) => void;
  /** 文本域皮肤尺寸（复用 Textarea 的 size 变体）。 */
  size?: VariantProps<typeof textareaVariants>["size"];
  /** 独立使用时标红。 */
  invalid?: boolean;
  className?: string;
  /** 浮层（候选列表）额外类名。 */
  popupClassName?: string;
}
