import type { ComponentPropsWithoutRef } from "react";

export interface StripedPatternProps extends ComponentPropsWithoutRef<"div"> {
  /** 条纹角度（度），默认 45 */
  angle?: number;
  /** 条纹+间隔单元宽 px，默认 10 */
  size?: number;
}
