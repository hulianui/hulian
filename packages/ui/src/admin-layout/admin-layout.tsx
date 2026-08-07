"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Menu } from "../_icons";
import { useLocaleValue } from "../config/locale-context";
import { resolveBreakpointPx } from "../layout/layout-sider";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { motionDurationCss, motionEaseCss } from "../motion";
import { NavMenu } from "../nav-menu/nav-menu";
import { RouteTabs } from "../route-tabs";
import { nextActiveKey } from "../route-tabs/route-tabs-core";
import type { RouteTabsAction } from "../route-tabs/route-tabs.types";
import { ScrollArea } from "../scroll-area";
import type { NavMenuItem, NavMenuNode } from "../nav-menu/nav-menu.types";
import type { AdminLayoutProps, AdminTab } from "./admin-layout.types";

// 收集菜单叶子项（无 children），供「点击菜单 → 自动开页签」拿到 key+label。
function collectLeaves(
  nodes: NavMenuNode[],
  out: Map<string, NavMenuItem>,
): Map<string, NavMenuItem> {
  for (const n of nodes) {
    if ("type" in n && n.type === "group") {
      collectLeaves(n.children, out);
      continue;
    }
    const item = n as NavMenuItem;
    if (item.children && item.children.length) collectLeaves(item.children, out);
    else out.set(item.key, item);
  }
  return out;
}

// AdminLayout = 中后台应用骨架：侧栏(品牌 + NavMenu·可折叠) + 顶栏(折叠触发 + 面包屑 + 扩展区)
// + 多页签导航(内嵌 RouteTabs：开/切/关 + 右键关闭其他/左侧/右侧/全部/刷新) + 内容区。
// 页签可受控(接路由)或非受控(菜单点击自动维护)。
export function AdminLayout({
  menuItems,
  logo,
  logoCollapsed,
  selectedKey: selectedKeyProp,
  defaultSelectedKey,
  onMenuSelect,
  openKeys,
  defaultOpenKeys,
  onOpenChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  breakpoint,
  showTabs = true,
  tabs: tabsProp,
  activeKey: activeKeyProp,
  defaultActiveKey,
  onTabChange,
  onTabClose,
  onTabsAction,
  breadcrumb,
  headerExtra,
  fitViewport = true,
  children,
  className,
  contentClassName,
}: AdminLayoutProps) {
  const t = useLocaleValue("adminLayout", {
    collapse: "收起侧栏",
    expand: "展开侧栏",
    closeTab: "关闭页签",
    tabActions: "页签操作",
    closeOthers: "关闭其他",
    closeAll: "关闭全部",
    closeLeft: "关闭左侧",
    closeRight: "关闭右侧",
    refreshTab: "刷新当前页",
    scrollLeft: "向左滚动",
    scrollRight: "向右滚动",
  });
  const leaves = useMemo(() => collectLeaves(menuItems, new Map()), [menuItems]);

  const [collapsedI, setCollapsedI] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? collapsedI;
  // 折叠态下侧栏只有 64px。没给窄版 logo 就只能拿宽 logo 顶上，overflow-hidden 会把它裁掉半截
  // ——不报错、只是难看，所以开发期明说一次（#121）。key 里不拼可变值，同一误用整个进程一条。
  if (collapsed && logoCollapsed == null && logo != null) {
    warnOnce(
      "admin-layout:logo-collapsed",
      "[瑚琏] AdminLayout：侧栏已折叠但没有传 logoCollapsed，宽版 logo 会在 64px 里被裁掉半截。请传一个窄版标识（首字 / 单色图标皆可）。",
    );
  }
  const setCollapsed = (v: boolean) => {
    if (collapsedProp === undefined) setCollapsedI(v);
    onCollapsedChange?.(v);
  };

  // 响应式断点（同 LayoutSider）：视口 ≤ 断点宽度时收起、> 时展开。jsdom 无 matchMedia → 守卫跳过。
  // onCollapsedChange 走 ref 持最新引用，避免回调变化反复重订阅。
  const collapseControlled = collapsedProp !== undefined;
  const onCollapsedChangeRef = useRef(onCollapsedChange);
  onCollapsedChangeRef.current = onCollapsedChange;
  useEffect(() => {
    if (breakpoint === undefined) return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(`(max-width: ${resolveBreakpointPx(breakpoint)}px)`);
    const apply = (matches: boolean) => {
      if (!collapseControlled) setCollapsedI(matches);
      onCollapsedChangeRef.current?.(matches);
    };
    apply(mql.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint, collapseControlled]);

  const [selectedI, setSelectedI] = useState<string | undefined>(
    defaultSelectedKey ?? defaultActiveKey,
  );
  const selected = selectedKeyProp ?? selectedI;

  const tabsControlled = tabsProp !== undefined;
  const [tabsI, setTabsI] = useState<AdminTab[]>(() => {
    const k = defaultActiveKey ?? defaultSelectedKey;
    return k && leaves.has(k) ? [{ key: k, label: leaves.get(k)!.label }] : [];
  });
  const tabs = tabsControlled ? tabsProp! : tabsI;

  const [activeI, setActiveI] = useState<string | undefined>(
    defaultActiveKey ?? defaultSelectedKey,
  );
  const active = activeKeyProp ?? activeI;

  const setActive = (key: string) => {
    if (activeKeyProp === undefined) setActiveI(key);
    if (selectedKeyProp === undefined) setSelectedI(key);
    onTabChange?.(key);
  };

  const handleMenuSelect = (key: string, item: NavMenuItem) => {
    if (!tabsControlled) {
      setTabsI((prev) =>
        prev.some((t) => t.key === key) ? prev : [...prev, { key, label: item.label }],
      );
    }
    setActive(key);
    onMenuSelect?.(key, item);
  };

  const closeTab = (key: string) => {
    onTabClose?.(key);
    if (tabsControlled) return;
    setTabsI((prev) => {
      const idx = prev.findIndex((t) => t.key === key);
      const next = prev.filter((t) => t.key !== key);
      if (key === active && next.length) {
        const neighbor = next[Math.min(idx, next.length - 1)];
        if (activeKeyProp === undefined) setActiveI(neighbor.key);
        if (selectedKeyProp === undefined) setSelectedI(neighbor.key);
        onTabChange?.(neighbor.key);
      }
      return next;
    });
  };

  /**
   * 批量动作。RouteTabs 已把「这次实际会关掉哪些 key」算好（排除 pinned / 不可关的），
   * 这里只负责：非受控时按它改内部 tabs、必要时挪激活页；受控时**必须把动作透出去**——
   * 此前这里只调 setActive、没有对外回调，受控消费方点「关闭其他」看着毫无反应。
   */
  const handleTabsAction = (action: RouteTabsAction, tabKey: string, affected: string[]) => {
    onTabsAction?.(action, tabKey, affected);
    if (action === "refresh" || affected.length === 0) return;
    if (tabsControlled) return;
    setTabsI((prev) => {
      const next = prev.filter((t) => !affected.includes(t.key));
      const nextActive = nextActiveKey(prev, affected, active);
      if (nextActive && nextActive !== active) {
        if (activeKeyProp === undefined) setActiveI(nextActive);
        if (selectedKeyProp === undefined) setSelectedI(nextActive);
        onTabChange?.(nextActive);
      }
      return next;
    });
  };

  const w = collapsed ? 64 : 232;
  const siderStyle: CSSProperties = {
    width: w,
    minWidth: w,
    maxWidth: w,
    flex: `0 0 ${w}px`,
    transitionProperty: "width, min-width, max-width, flex-basis",
    transitionDuration: motionDurationCss.base,
    transitionTimingFunction: motionEaseCss.out,
  };

  return (
    <div
      className={cn(
        "flex min-h-0 w-full overflow-hidden bg-bg text-foreground",
        // 整页骨架固定视口高度、自我撑高，内容区内部滚动，不依赖祖先元素定高度；
        // 嵌入定高容器预览时用 h-full 跟随父容器。
        fitViewport ? "h-dvh" : "h-full",
        className,
      )}
    >
      <aside
        data-collapsed={collapsed || undefined}
        style={siderStyle}
        className="flex flex-col border-r border-border bg-surface"
      >
        {/* 折叠态下容器的**对齐方式**也要跟着切：内容换成窄版 logo 了，但 px-4 + 默认
            justify-start 仍把它顶在左边，而紧下方 NavMenu mode="collapsed" 是居中的图标轨
            —— 同一列里上下两块用两套水平对齐，整个左上角看起来是歪的（#121）。
            高度读 --hl-layout-header-h，与右侧 header 共用同一个数，天然齐平（#120）。 */}
        <div
          className={cn(
            "flex h-[var(--hl-layout-header-h)] shrink-0 items-center gap-2 overflow-hidden border-b border-border font-semibold",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          {collapsed ? logoCollapsed ?? logo : logo}
        </div>
        <ScrollArea className="min-h-0 flex-1 rounded-none">
          <NavMenu
            className="p-2"
            items={menuItems}
            mode={collapsed ? "collapsed" : "inline"}
            selectedKeys={selected ? [selected] : []}
            onSelect={handleMenuSelect}
            openKeys={openKeys}
            defaultOpenKeys={defaultOpenKeys}
            onOpenChange={onOpenChange}
          />
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[var(--hl-layout-header-h)] shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
          <button
            type="button"
            aria-label={collapsed ? t.expand : t.collapse}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
            className="inline-grid size-9 shrink-0 place-items-center rounded-[var(--radius)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1 truncate">{breadcrumb}</div>
          {headerExtra != null && (
            <div className="flex shrink-0 items-center gap-2">{headerExtra}</div>
          )}
        </header>

        {showTabs && tabs.length > 0 && (
          <RouteTabs
            items={tabs}
            activeKey={active}
            onChange={setActive}
            onClose={closeTab}
            onAction={handleTabsAction}
          />
        )}

        <main
          className={cn("min-h-0 min-w-0 flex-1 overflow-auto bg-bg p-4 sm:p-6", contentClassName)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
