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
   * 注意：render 模式为降低风险不套 motion，故无 press 缩放动效（颜色/hover 过渡仍在）。
   */
  render?: ReactElement;
}
