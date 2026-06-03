import type { ReactNode } from "react";

export interface LensProps {
  children?: ReactNode;
  /** 放大倍数。 */
  zoom?: number;
  /** 镜片直径(px)。 */
  size?: number;
  className?: string;
}
