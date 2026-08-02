import type { ComponentPropsWithoutRef, ElementType } from "react";

// 多态组件（`as` 换标签）的类型底座。
//
// 为什么必须泛型：`as?: ElementType` + `HTMLAttributes<HTMLElement>` 的写法里，`as` 不参与
// 推导，于是 `as="form"` 之后 `onSubmit` 的 `event.currentTarget` 仍是 `HTMLElement`——
// `elements`/`action` 这些表单专有 API 全拿不到，消费方只能 as-cast，而 cast 掉的
// 正是类型安全本身（hulianui/hulian#62）。
//
// 用法：
//   export interface StackOwnProps { gap?: number; children?: ReactNode }
//   export type StackProps<E extends ElementType = "div"> = PolymorphicProps<E, StackOwnProps>;
//   export function Stack<E extends ElementType = "div">(props: StackProps<E>) { … }
//
// 组件内部把 `as` 收成 `ElementType` 再渲染即可（运行时行为一点没变）。

export type PolymorphicProps<E extends ElementType, Own> = Own & {
  /** 渲染成哪个标签/组件。事件与属性类型会跟着它走。 */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof Own | "as">;
