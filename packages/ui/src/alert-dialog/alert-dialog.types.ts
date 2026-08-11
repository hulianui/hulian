import type { ReactNode } from "react";

export interface AlertDialogContentProps {
  /** 标题（必填，a11y label）。 */
  title: ReactNode;
  /**
   * 说明文案（可选）。
   *
   * **只能放 phrasing content**（文本、`<span>`、`<strong>`、`<a>`…）：Base UI 的
   * AlertDialog.Description 渲染成 `<p>`，塞 `<div>` / `<ul>` / 卡片这类块级内容是非法嵌套，
   * 浏览器会提前闭合 `<p>`，React 当场报 hydration mismatch。块级正文放 `body`。
   */
  description?: ReactNode;
  /**
   * 正文区（可选）：渲染在 description 之下、动作区之上，**不包 `<p>`**，
   * 所以放「删除对象摘要卡」「受影响项列表」这类块级内容是合法的。
   */
  body?: ReactNode;
  /**
   * 标题行左侧的状态图标（可选）：给「不可逆操作」加一个警示符号。
   * 组件只负责与标题/说明的 flex 对齐，颜色由调用方用 token 类自己给
   * （危险操作用 `text-danger`，警告用 `text-warning`）。
   */
  icon?: ReactNode;
  /** 底部操作区：放「取消 / 确认」按钮（取消用 AlertDialogClose）。 */
  children?: ReactNode;
  className?: string;
}
