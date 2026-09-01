"use client";
import { createContext, useContext } from "react";

/**
 * 「我在 CheckboxGroup / RadioGroup 里」+「我在 Field 里」两个 flag。
 *
 * 组放进 Field 时，Field 标签会成为组内**每一项**的无障碍名（读屏念出 N 个同名项）。Base UI 的 Field.Item
 * 给每项一个新的标签作用域：名字回落到自己的 label，description / error 仍从 Field 继承。但 Field.Item
 * 没有 Field.Root 祖先时会抛错，而 Base UI 不导出探测 Field 的 hook，所以由本库的 Field 自己立 flag。
 * 不在组内的单个 Checkbox 由 Field 标签命名是对的，所以只在「组内 且 Field 内」才包。
 */
export const LabelledGroupContext = createContext(false);
export const FieldScopeContext = createContext(false);

export function useNeedsFieldItem(): boolean {
  const inGroup = useContext(LabelledGroupContext);
  const inField = useContext(FieldScopeContext);
  return inGroup && inField;
}
