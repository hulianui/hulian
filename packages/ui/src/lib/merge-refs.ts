import type { Ref } from "react";

export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * 把若干个 ref 并成一个。
 *
 * 组件自己要拿 DOM（量 scrollHeight、做定位）**又**要把同一个节点交给消费方时用它：
 * 两边各拿各的，不必二选一 —— 「组件内部占着 ref 所以消费方拿不到」是 #186 那类缺口的成因，
 * 而消费方一旦拿不到，`focus()` / `select()` / react-hook-form 的 `register()` 全都没有出口。
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value) => refs.forEach((ref) => setRef(ref, value));
}
