import type { ComponentPropsWithoutRef } from "react";

export interface RainbowButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** 彩虹流动一轮秒数，默认 3s */
  speed?: string;
}
