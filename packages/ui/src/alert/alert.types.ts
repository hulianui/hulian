import type { HTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { alertVariants } from "./alert";

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">, // 避开 HTML title 属性与 ReactNode title 冲突
    VariantProps<typeof alertVariants> {
  /** 可选图标 slot（调用方自带 SVG/emoji；设计系统不绑图标库）。 */
  icon?: ReactNode;
  /** 标题（可选）；children 为正文 description。 */
  title?: ReactNode;
}
