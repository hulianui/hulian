import type { HTMLAttributes, ReactNode } from "react";

export type KbdTone = "default" | "primary";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** 色调：default 中性灰；primary 品牌浅底 + 品牌边，用于页面主快捷键（顶栏搜索 ⌘K 等）。@default "default" */
  tone?: KbdTone;
  children?: ReactNode;
}

// 根节点是 <span>，所以取 HTMLSpanElement（KbdProps 用 HTMLElement 是因为 <kbd> 本来就没有
// 专属接口）。`keys` / `separator` / `label` 都不是 HTMLAttributes 的成员，无需 Omit。
export interface KbdGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** 键名数组，逐个包成 Kbd。组合键的常规写法（`["⌘", "K"]`）。 */
  keys?: ReactNode[];
  /** 自己摆 Kbd 时用；给了 children 就忽略 keys（两者同时给没有合理语义）。 */
  children?: ReactNode;
  /** 下发给 keys 生成的每个键帽，分隔符跟着变色。自己传 children 时请在每个 Kbd 上写 tone。@default "default" */
  tone?: KbdTone;
  /** 键之间的分隔符，装饰性（不进无障碍树）。传 `null` 只留间距不画符号。 */
  separator?: ReactNode;
  /** 整组的无障碍名，如「打开命令面板」。给了才会加 `role="group"`。 */
  label?: string;
}
