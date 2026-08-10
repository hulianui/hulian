import type { HTMLAttributes, ReactNode } from "react";

export interface ScopeValue {
  /** 允许列表（白名单）。空数组表示不启用白名单语义。 */
  allow: string[];
  /** 禁止列表（黑名单）。 */
  deny: string[];
}

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface ScopeMatrixProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  allow: string[];
  deny: string[];
  /** 受控回调。不给则为只读展示。 */
  onChange?: (next: ScopeValue) => void;
  /** 候选模式，点击即填入输入框。常见做法是从当前项目结构推导。 */
  suggestions?: string[];
  /** 只读模式：即使给了 onChange 也不渲染编辑入口。 */
  readOnly?: boolean;
  /**
   * 模式校验。返回错误文案表示非法，返回 null 表示合法。
   * 组件不内置 glob 语法校验 —— 不同系统的模式方言差异很大
   * （glob / 正则 / ant 风格 / 自定义 DSL），内置只会猜错。
   */
  validate?: (pattern: string) => string | null;
  allowLabel?: ReactNode;
  denyLabel?: ReactNode;
  allowHint?: ReactNode;
  denyHint?: ReactNode;
  placeholder?: string;
  className?: string;
}
