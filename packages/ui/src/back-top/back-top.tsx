"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "../_icons";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import type { BackTopProps } from "./back-top.types";

// 回顶悬浮钮（"use client"·零依赖）：监听滚动容器(默认 window)，scrollTop 超 visibilityHeight 淡入；
// 点击 scrollTo({top:0}) smooth 回顶，prefers-reduced-motion 时 behavior:auto 不动画。
// 默认右下圆形悬浮钮吃 surface/border token + 阴影；children 可自定义内容。

export function BackTop({
  "aria-label": ariaLabel,
  target,
  visibilityHeight = 400,
  onClick,
  children,
  className,
}: BackTopProps) {
  const locale = useComponentLocale();
  const resolvedAriaLabel = ariaLabel ?? locale.backTop?.backToTop ?? "回到顶部";
  const [visible, setVisible] = useState(false);

  // 解析滚动目标：缺省 / 返回 null 时回落 window。
  const getTarget = useCallback((): HTMLElement | Window => {
    if (!target) return window;
    return target() ?? window;
  }, [target]);

  useEffect(() => {
    const el = getTarget();
    const getScrollTop = () => (el === window ? window.scrollY : (el as HTMLElement).scrollTop);
    const onScroll = () => setVisible(getScrollTop() > visibilityHeight);
    onScroll(); // 挂载即按当前滚动位判定一次
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getTarget, visibilityHeight]);

  const handleClick = () => {
    const el = getTarget();
    // reduced-motion 读在点击时（事件回调内·SSR 安全）；smooth↔auto 切换。
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    onClick?.();
  };

  return (
    <button
      type="button"
      aria-label={resolvedAriaLabel}
      onClick={handleClick}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full border border-hairline bg-surface text-foreground shadow-lg outline-none transition-opacity hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
    >
      {children ?? <ArrowUp className="size-5" aria-hidden />}
    </button>
  );
}
