import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";

/**
 * 虚拟键盘策略。`auto` 触屏设备聚焦时弹出、`manual` 只由键盘切换钮弹出、`off` 不挂键盘
 * （策略置 manual 并隐藏切换钮）。MathLive 自身没有 off。
 */
export type MathFieldKeyboardPolicy = "auto" | "manual" | "off";

/**
 * 满足 `MathFieldLikeProps`（`value` / `onChange` / `onSubmit` / `disabled` / `aria-label` / `className`），
 * 可直接注入 MathTextarea 的 `visualEditor` 与 QuestionAnswer 的 `mathField`。
 */
export interface MathFieldProps extends MathFieldLikeProps {
  /** @default "auto" */
  virtualKeyboard?: MathFieldKeyboardPolicy;
  /**
   * 透传给 `window.mathVirtualKeyboard.layouts`。键盘是**页面级单例**：同页多个 MathField 共用，
   * 后挂载的覆盖先挂载的。类型刻意是 unknown[]，对外类型不引用 mathlive（没装它的消费方也要能 typecheck）。
   */
  keyboardLayouts?: readonly unknown[];
  /** 只读：能选中、复制，不能改。与 `disabled` 的差别同原生 input。@default false */
  readOnly?: boolean;
  placeholder?: string;
}
