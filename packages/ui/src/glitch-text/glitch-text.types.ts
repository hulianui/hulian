import type { ComponentPropsWithoutRef } from "react";

export interface GlitchTextProps extends ComponentPropsWithoutRef<"span"> {
  /** 要做撕裂故障效果的文本（必须是纯字符串，供伪元素 attr(data-text) 复制） */
  children: string;
  /** 撕裂周期秒数（越小越狂躁）。默认 2.5 */
  speed?: number;
  /** 仅悬停时故障，静息为普通文本。默认 false（常驻故障） */
  enableOnHover?: boolean;
}
