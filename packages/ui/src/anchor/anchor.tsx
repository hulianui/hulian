"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { AnchorItem, AnchorProps } from "./anchor.types";
import { useComponentLocale } from "../config/locale-context";

// 递归扁平化锚点项（保持文档顺序），供 scrollspy 取「文档顺序最靠前的可见项」。纯函数，可单测。
export function flattenAnchorItems(items: AnchorItem[]): AnchorItem[] {
  const out: AnchorItem[] = [];
  for (const item of items) {
    out.push(item);
    if (item.children?.length) out.push(...flattenAnchorItems(item.children));
  }
  return out;
}

const hrefToId = (href: string) => href.replace(/^#/, "");

// 自研锚点导航（零依赖·"use client"）：
//  · 点击平滑滚到目标（scrollTo + offsetTop 扣除，避开固定页头）
//  · IntersectionObserver 监听各 section → 高亮当前锚点
//  · 滑动指示条复用 Tabs 那套「active 几何写 CSS 变量 + 纯 CSS transition」技法（零 motion 运行时）
export function Anchor({
  items,
  offsetTop = 0,
  onChange,
  getContainer,
  className,
  "aria-label": ariaLabel,
  ...props
}: AnchorProps) {
  const labels = useComponentLocale().anchor ?? { navigation: "锚点导航" };
  const flat = useMemo(() => flattenAnchorItems(items), [items]);
  const ids = useMemo(() => flat.map((i) => hrefToId(i.href)), [flat]);

  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();

  // 稳定引用：避免 IO 订阅因 onChange/active 重建，且回调里读到最新值
  const activeRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const visibleRef = useRef<Record<string, boolean>>({});

  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // 激活项变更：去重 + 触发 onChange
  const updateActive = useCallback((href: string) => {
    if (activeRef.current === href) return;
    activeRef.current = href;
    setActive(href);
    onChangeRef.current?.(href);
  }, []);

  // scrollspy：观测各 section，取文档顺序最靠前的可见项为当前锚点
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // 自定义容器作 IO root（内层滚动体场景）；否则 null = 视口
    const root = getContainer?.() ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          visibleRef.current[(e.target as HTMLElement).id] = e.isIntersecting;
        const first = ids.find((id) => visibleRef.current[id]);
        if (first) updateActive(`#${first}`);
      },
      // 上沿收缩 offsetTop（与固定页头对齐），下沿收缩 55% → 仅当 section 顶部进入根上 ~45% 才算当前
      { root, rootMargin: `-${offsetTop}px 0px -55% 0px`, threshold: 0 },
    );
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, offsetTop, updateActive, getContainer]);

  // 滑块测量：active 变化时读取激活链接的 offsetTop/offsetHeight（相对定位的 <ul>）写进 CSS 变量
  useLayoutEffect(() => {
    const bar = indicatorRef.current;
    if (!bar) return;
    const el = active ? linkRefs.current.get(active) : undefined;
    if (!el) {
      bar.style.opacity = "0";
      return;
    }
    bar.style.opacity = "1";
    bar.style.setProperty("--active-anchor-top", `${el.offsetTop}px`);
    bar.style.setProperty("--active-anchor-height", `${el.offsetHeight}px`);
  }, [active]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const el = document.getElementById(hrefToId(href));
    if (!el) return; // 容错：目标不存在则交给默认行为/不处理
    e.preventDefault();
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    const container = getContainer?.() ?? null;
    if (container) {
      // 目标相对容器内容顶部的距离 = 两者视口 rect 差 + 容器已滚距离 - 偏移
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        offsetTop;
      container.scrollTo({ top, behavior });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - offsetTop;
      window.scrollTo({ top, behavior });
    }
    updateActive(href);
  };

  const renderItems = (list: AnchorItem[], level: number) =>
    list.map((item) => {
      const isActive = active === item.href;
      return (
        <li key={item.href}>
          <a
            ref={(node) => {
              if (node) linkRefs.current.set(item.href, node);
              else linkRefs.current.delete(item.href);
            }}
            href={item.href}
            aria-current={isActive ? "location" : undefined}
            onClick={(e) => handleClick(e, item.href)}
            className={cn(
              "block truncate py-1 text-sm transition-colors",
              level === 0 ? "pl-3" : "pl-6",
              isActive ? "font-medium text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {item.title}
          </a>
          {item.children?.length ? (
            <ul className="mt-0.5 space-y-0.5">{renderItems(item.children, level + 1)}</ul>
          ) : null}
        </li>
      );
    });

  return (
    <nav
      aria-label={ariaLabel ?? labels.navigation}
      className={cn("text-sm", className)}
      {...props}
    >
      <ul className="relative space-y-0.5 border-l border-border">
        {/* 滑动指示条：几何由激活链接测量后写入 CSS 变量，纯 CSS transition 平滑滑动（零 motion 运行时） */}
        <span
          ref={indicatorRef}
          data-anchor-indicator=""
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 w-0.5 rounded-full bg-primary"
          style={{
            opacity: 0,
            height: "var(--active-anchor-height, 0px)",
            transform: "translateY(var(--active-anchor-top, 0px))",
            transitionProperty: "transform, height, opacity",
            transitionDuration: reduced ? "0ms" : motionDurationCss.base,
            transitionTimingFunction: motionEaseCss.out,
          }}
        />
        {renderItems(items, 0)}
      </ul>
    </nav>
  );
}
