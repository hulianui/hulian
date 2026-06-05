import type { ComponentPropsWithoutRef } from "react";

export type DecryptTrigger = "view" | "hover";

export interface DecryptedTextProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** 目标明文 */
  text: string;
  /** 每次乱码刷新间隔毫秒。默认 55 */
  speed?: number;
  /** 触发方式：view 滚入视口一次性解码 / hover 悬停解码、移出复位。默认 view */
  animateOn?: DecryptTrigger;
  /** 乱码取样字符集。默认大小写字母 + 数字 + 符号 */
  characters?: string;
}
