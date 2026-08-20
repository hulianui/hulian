"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 画廊类页面共用的「按需挂载」：元素进入近视口前，children 完全不渲染
 * —— 不进 DOM、不跑 effect、不发请求。
 *
 * 为什么必须是「不渲染」而不是 inert/hidden：inert 只挡交互，挡不住 React effects、
 * 计时器、图片请求和持续运行的动效。/pages 画廊曾把 20 个整页预览全当活组件挂上，
 * 实测顶层 document 6353 个节点。
 *
 * 一旦挂载就断开观察，不再来回卸载：滚回去重跑一遍入场动画比多留几个节点更糟。
 *
 * @param rootMargin 提前量。刻意不给大值 —— 未挂载的占位比挂载后矮，提前量一大就会
 *   连锁把更下面的也拉进观察窗，首屏外挂载数不降反升。
 */
export function useLazyMount<T extends HTMLElement>(enabled = true, rootMargin = "0px") {
  const ref = useRef<T>(null);
  const [mounted, setMounted] = useState(!enabled);

  useEffect(() => {
    if (mounted) return;
    const host = ref.current;
    if (!host) return;
    // 无 IntersectionObserver(老浏览器 / jsdom)→ 直接挂载，宁可多渲染也不能让画廊空着。
    if (typeof IntersectionObserver !== "function") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  return { ref, mounted };
}
