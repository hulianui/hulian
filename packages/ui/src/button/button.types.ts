import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactElement } from "react";
import type { buttonVariants } from "./button";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /**
   * 渲染为自定义元素（如 `<a>` / Next `<Link>`）而非 `<button>`，用于「按钮样式的链接」CTA。
   * 按钮样式 className 与禁用态(aria-disabled)会合并进该元素；文案优先取 Button 的 children。
   * 按压反馈与 `<button>` 分支同源（都在底座的 className 里），两条路手感一致。
   */
  render?: ReactElement;
}
