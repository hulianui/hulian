import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackDirection = "row" | "column";

/** 响应式方向：按断点给主轴方向（base 为默认/最小屏）。断点表与 Tailwind 对齐到 2xl。 */
export interface ResponsiveDirection {
  base?: StackDirection;
  sm?: StackDirection;
  md?: StackDirection;
  lg?: StackDirection;
  xl?: StackDirection;
  "2xl"?: StackDirection;
}

export interface StackOwnProps {
  /** 主轴方向。传字符串=固定；传 {base,sm,md,lg,xl,2xl}=响应式。@default "column" */
  direction?: StackDirection | ResponsiveDirection;
  /** 子项间距（× 0.25rem，同 Tailwind spacing 刻度）。@default 0 */
  gap?: number;
  /** 交叉轴对齐。 */
  align?: StackAlign;
  /** 主轴对齐。 */
  justify?: StackJustify;
  /** 是否换行（仅 row 有意义）。@default false */
  wrap?: boolean;
  /** 用 inline-flex 而非 flex（随内容收缩、可与文字基线排列）。@default false */
  inline?: boolean;
  children?: ReactNode;
  className?: string;
}

/** `as` 参与类型推导：`as="form"` 时 onSubmit 拿到 FormEvent<HTMLFormElement>。 */
export type StackProps<E extends ElementType = "div"> = PolymorphicProps<E, StackOwnProps>;

export interface StackItemOwnProps {
  /** 占用主轴剩余空间。true -> flex-1。 */
  grow?: boolean;
  /** 是否允许收缩。false -> shrink-0；true/undefined 保持浏览器默认。 */
  shrink?: boolean;
  /** 允许 flex 子项内容收缩。0 -> min-w-0。 */
  minWidth?: 0;
  children?: ReactNode;
  className?: string;
}

type StackItemRef<E extends ElementType> = ComponentPropsWithRef<E> extends {
  ref?: infer Ref;
}
  ? Ref
  : never;

export type StackItemProps<E extends ElementType = "div"> = PolymorphicProps<E, StackItemOwnProps> & {
  /** React 19 下作为普通 prop 透传到 `as` 指定的元素；只补 StackItem，不扩大共享多态底座。 */
  ref?: StackItemRef<E>;
};
