import type { HTMLAttributes, ReactNode } from "react";

export interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  /** 卡片标题。 */
  title?: ReactNode;
  /** 描述。 */
  description?: ReactNode;
  /** 左上图标/装饰。 */
  icon?: ReactNode;
  /** 底部行动区（按钮/链接）。 */
  cta?: ReactNode;
  children?: ReactNode;
}
