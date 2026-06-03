import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface GlareHoverProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
  /** 反光色，默认半透明白（玻璃光泽，明暗皆宜） */
  glareColor?: string;
  /** 扫光时长，默认 650ms */
  duration?: string;
}
