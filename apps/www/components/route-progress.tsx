"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 全局路由进度条 —— App Router 客户端导航的即时反馈。
 *
 * 为什么需要：App Router 点 <Link> 后会**停留在当前页**，直到目标路由的
 * JS chunk + RSC 下载完才切换；期间无任何反馈，重 chunk 路由（demos）下感觉卡死。
 *
 * 关键点：必须在 **click 捕获阶段**就启动（不能等 history.pushState —— App Router
 * 的 pushState 发生在导航“就绪之后”，那时再启动就太晚）。完成则监听 usePathname 变化。
 * 纯 CSS transition + trickle，零依赖，吃主题 primary token。
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (doneRef.current) clearTimeout(doneRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    trickleRef.current = doneRef.current = safetyRef.current = null;
  };

  const start = () => {
    clearTimers();
    setVisible(true);
    setProgress(8);
    // 缓慢爬升到 ~90%，永远到不了 100%，等导航完成再补满 —— 经典 nprogress 手感。
    trickleRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.12 + 0.5));
    }, 200);
    // 兜底：8s 内没等到 pathname 变化（同页锚点 / 被取消的导航）就自动收尾，避免常驻。
    safetyRef.current = setTimeout(() => finish(), 8000);
  };

  const finish = () => {
    clearTimers();
    setProgress(100);
    doneRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
  };

  // 点击捕获：在路由介入前就识别“这是一次站内跳转”，立刻起条。
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // 外链不管
      // 同一路径（仅 hash/query 变化或原地点击）不起条，避免常驻
      if (url.pathname === window.location.pathname) return;
      start();
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // pathname 变化 = 导航真正完成 → 补满收尾。
  useEffect(() => {
    if (visible) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => clearTimers(), []);

  if (!visible) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2.5,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--color-primary)",
          boxShadow: "0 0 8px var(--color-primary), 0 0 4px var(--color-primary)",
          borderTopRightRadius: 2,
          borderBottomRightRadius: 2,
          transition: "width 200ms ease",
        }}
      />
    </div>
  );
}
