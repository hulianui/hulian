import type { ComponentPropsWithoutRef } from "react";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  /** 高光带宽度 px，默认 100 */
  shimmerWidth?: number;
}
