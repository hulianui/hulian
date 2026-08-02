"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import { useLocale } from "../config/locale";
import { motionDurationCss, motionEaseCss } from "../motion";
import { ScrollArea } from "../scroll-area";
import type { LayoutBreakpoint, LayoutCollapseType, LayoutSiderProps } from "./layout.types";

// Tailwind 默认断点 → 像素，供响应式自动收起的 matchMedia 使用。
const BREAKPOINT_PX: Record<Exclude<LayoutBreakpoint, number>, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/** 断点名/自定义像素数 → 像素宽。AdminLayout 等自绘侧栏的骨架件复用，保证断点语义一致。 */
export function resolveBreakpointPx(breakpoint: LayoutBreakpoint): number {
  return typeof breakpoint === "number" ? breakpoint : BREAKPOINT_PX[breakpoint];
}

// 默认折叠 chevron：收起态指向右（展开方向），展开态指向左。
function DefaultTrigger({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 transition-transform", collapsed && "rotate-180")}
      style={{
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      }}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/**
 * 侧栏：可折叠（宽度过渡走 motion-token CSS 镜像，零运行时）、受控/非受控收起、
 * breakpoint 窄屏自动收起、底部 trigger 折叠按钮。内容区复用 ScrollArea 可滚动。
 * 唯一需要客户端态的部件，故单独 "use client"，让 Layout/Header/Content/Footer 保持可 RSC。
 */
export function LayoutSider({
  width = 240,
  collapsedWidth = 64,
  collapsible = false,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapse,
  breakpoint,
  trigger,
  className,
  style,
  children,
  ...props
}: LayoutSiderProps) {
  const locale = useLocale().adminLayout;
  const isControlled = collapsedProp !== undefined;
  const [internal, setInternal] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internal;

  // onCollapse 用 ref 持最新引用，避免 breakpoint effect 因回调变化反复重订阅。
  const onCollapseRef = useRef(onCollapse);
  onCollapseRef.current = onCollapse;

  const setCollapsed = (next: boolean, type: LayoutCollapseType) => {
    if (!isControlled) setInternal(next);
    onCollapseRef.current?.(next, type);
  };

  // 响应式断点：视口 ≤ 断点宽度时收起、> 时展开。jsdom 无 matchMedia → 守卫跳过。
  useEffect(() => {
    if (breakpoint === undefined) return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(`(max-width: ${resolveBreakpointPx(breakpoint)}px)`);
    const apply = (matches: boolean) => {
      if (!isControlled) setInternal(matches);
      onCollapseRef.current?.(matches, "responsive");
    };
    apply(mql.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
    // isControlled/breakpoint 决定订阅；onCollapse 走 ref 不入依赖。
  }, [breakpoint, isControlled]);

  const w = collapsed ? collapsedWidth : width;
  const widthStyle: CSSProperties = {
    width: w,
    minWidth: w,
    maxWidth: w,
    flex: `0 0 ${w}px`,
    transitionProperty: "width, min-width, max-width, flex-basis",
    transitionDuration: motionDurationCss.base,
    transitionTimingFunction: motionEaseCss.out,
    ...style,
  };

  const showTrigger = collapsible && trigger !== null;

  return (
    <aside
      data-layout-sider=""
      {...(collapsed ? { "data-collapsed": "" } : {})}
      className={cn("flex flex-col border-r border-border bg-surface text-foreground", className)}
      style={widthStyle}
      {...props}
    >
      {/* 内容区：复用 ScrollArea 细滚动条，flex-1 占满 trigger 之外空间。rounded-none 抹掉默认圆角。 */}
      <ScrollArea className="min-h-0 flex-1 rounded-none">{children}</ScrollArea>
      {showTrigger && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed, "clickTrigger")}
          aria-expanded={!collapsed}
          aria-label={collapsed ? locale.expand : locale.collapse}
          className={cn(
            "flex h-12 shrink-0 items-center justify-center border-t border-border text-muted outline-none transition-colors",
            "hover:bg-surface-hover hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          )}
        >
          {trigger ?? <DefaultTrigger collapsed={collapsed} />}
        </button>
      )}
    </aside>
  );
}
