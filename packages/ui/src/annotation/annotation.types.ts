import type { ElementType, ReactNode } from "react";

/**
 * 标注所在的方位（与 Tooltip/Popover 的 side 语义一致：说的是**注解自己在哪**，
 * 不是箭头指哪）。side="s" → 标签在目标下方，箭头由下往上指回目标。
 */
export type AnnotationSide = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export type AnnotationTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "rainbow";

export interface AnnotationProps {
  /**
   * 标签内容。省略（或传空）时只保留荧光笔底色，不画箭头也不画标签 ——
   * 用来单纯圈出一段内容。
   *
   * ⚠️ 标注是**旁注**：默认对读屏是可见的补充说明，但不要把操作指令、
   * 校验错误、状态这类必读信息**只**写在这里。
   */
  note?: ReactNode;
  /** 标签方位，8 向。默认 "ne"（右上）。 */
  side?: AnnotationSide;
  /** 语气色。默认 neutral（暖灰）。rainbow 为循环色相，仅装饰用。 */
  tone?: AnnotationTone;
  /**
   * 目标底色标记（荧光笔）。默认 true。
   *
   * 底色会向左右各外扩一点模仿马克笔涂过头，量由 CSS 变量 `--hl-ann-spread`
   * 控制（默认 `0.3em`）。同一行里几条标注紧挨着时底色会连成一整片，
   * 传 `className="[--hl-ann-spread:0px]"` 即可断开 —— 单位不能省，
   * `calc(-1 * 0)` 得到的是 `<number>` 而非 `<length>`，box-shadow 会拒收整条声明。
   */
  mark?: boolean;
  /** 标签倾斜角（deg）。默认 -4，手写便签的随手感来源。传 0 摆正。 */
  rotate?: number;
  /** 标签折行前的最大宽度（px）。默认 150。 */
  labelWidth?: number;
  /** 目标与箭头之间的留白（px）。默认 5。 */
  gap?: number;
  /** 箭头与标签之间的留白（px）。默认 6。 */
  labelGap?: number;
  /**
   * 箭头与标签的整体微调（px）。多条标注挤在一起时用来错开。
   *
   * 在 side 占据的那根轴上，正值 = 远离目标（左右两侧对称，都往外推）；
   * side 不占的那根轴上（如 side="s" 时的 x），正值 = 向右 / 向下平移。
   */
  offset?: { x?: number; y?: number };
  /**
   * 标签用手写字体栈。默认 true。
   *
   * 中文注意：字体栈里的中文手写体（手札体 / 翩翩体 / 华文行楷等）是**系统字体**，
   * 装了才有；没装则回落到正文字体，此时倾斜角与配色仍在，只是少了手写笔触。
   * 要保证中文也是手写体，请自行 @font-face 引入并覆盖 `--hl-annotation-font`。
   */
  handwritten?: boolean;
  /** 目标元素的标签名，默认 span。目标必须能容纳 inline-block。 */
  as?: ElementType;
  /** 被标注的内容。 */
  children?: ReactNode;
  className?: string;
  /** 标签自身的 class（改字号、字重等）。 */
  labelClassName?: string;
}
