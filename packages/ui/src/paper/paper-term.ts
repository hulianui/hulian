"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { usePaperContext } from "./paper-context";
import type { PaperTermBinding } from "./paper.types";

// 公式项 ↔ 图控件的双向高亮（主入口这一半，不碰 KaTeX）。
// 公式那一半是 @hulianui/ui/math 的 PaperEquation：它悬停 / 聚焦某一项时写 Paper 的 term store，
// 图里用 usePaperTerm 绑定的控件读到 active；反过来控件悬停 / 聚焦时，公式里的那一项亮起来。

const noopSubscribe = () => () => {};
const none = () => null;

/**
 * 把图里的一个控件（或图的一部分）绑到公式项 `name` 上。
 * 在 `Paper` 外调用时 `active` 恒为 false、绑定是空操作。
 */
export function usePaperTerm(name: string): PaperTermBinding {
  const store = usePaperContext()?.terms;
  const active = useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    () => (store?.get() ?? none()) === name,
    () => false,
  );

  const enter = useCallback(() => store?.set(name), [store, name]);
  const leave = useCallback(() => {
    if (store?.get() === name) store.set(null);
  }, [store, name]);

  const bind = useMemo(
    () => ({
      onPointerEnter: enter,
      onPointerLeave: leave,
      onFocus: enter,
      onBlur: leave,
      "data-paper-term": name,
    }),
    [enter, leave, name],
  );

  return { active, bind: active ? { ...bind, "data-active": "" } : bind };
}
