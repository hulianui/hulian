import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  tone?: "primary" | "foreground" | "danger";
  underline?: "always" | "hover" | "none";
  /** 外链：加 target=_blank + rel=noopener noreferrer + 尾随外链图标。 */
  external?: boolean;
  children?: ReactNode;
}
