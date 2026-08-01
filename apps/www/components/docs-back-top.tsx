"use client";
import { useCallback, useEffect, useState } from "react";
import { BackTop } from "@hulianui/ui";

// dogfood：文档站的滚动体**按断点变**，回顶钮必须跟着换目标，否则移动端永远不出现。
//   - md+：外壳定高，<main data-layout-content> 自己滚 → target 指向它。
//   - < md：外壳不定高，main 虽有 overflow-auto 但从不产生自身滚动条，滚的是文档 →
//           返回 null 让 BackTop 回落 window（其 getTarget 对 null 有回落）。
// target 是 function prop，不能跨 RSC 边界传，这层客户端包装承接；
// 断点变化时返回新的 target 引用，BackTop 的 effect 依赖 getTarget 会重新订阅滚动。
export function DocsBackTop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return; // jsdom 无 matchMedia
    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const target = useCallback(
    () => (isDesktop ? document.querySelector<HTMLElement>("main[data-layout-content]") : null),
    [isDesktop],
  );

  return <BackTop target={target} visibilityHeight={300} />;
}
