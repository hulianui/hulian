"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { Menu, X } from "../_icons";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { NavMenu } from "../nav-menu/nav-menu";
import { Popover, PopoverContent, PopoverClose, PopoverTrigger } from "../popover";
import { ScrollArea } from "../scroll-area";
import type { NavMenuItem, NavMenuNode } from "../nav-menu/nav-menu.types";
import type { AdminLayoutProps, AdminTab } from "./admin-layout.types";

// 收集菜单叶子项（无 children），供「点击菜单 → 自动开页签」拿到 key+label。
function collectLeaves(nodes: NavMenuNode[], out: Map<string, NavMenuItem>): Map<string, NavMenuItem> {
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

const Ellipsis = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);

interface TabBarProps {
  tabs: AdminTab[];
  active?: string;
  onActivate: (key: string) => void;
  onClose: (key: string) => void;
  onCloseOthers: (key: string) => void;
  onCloseAll: () => void;
}

function TabBar({ tabs, active, onActivate, onClose, onCloseOthers, onCloseAll }: TabBarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-surface px-2">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = t.key === active;
          const closable = t.closable ?? tabs.length > 1;
          return (
            <div
              key={t.key}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onActivate(t.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onActivate(t.key);
                }
              }}
              className={cn(
                "group flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius)-0.25rem)] pl-3 text-sm whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                closable ? "pr-1.5" : "pr-3",
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              {isActive && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
              <span className="truncate">{t.label}</span>
              {closable && (
                <button
                  type="button"
                  aria-label="关闭页签"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(t.key);
                  }}
                  className="inline-flex size-4 items-center justify-center rounded-full opacity-50 transition-opacity hover:bg-surface-hover hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <Popover>
        <PopoverTrigger
          aria-label="页签操作"
          className="inline-grid size-7 shrink-0 place-items-center rounded-[calc(var(--radius)-0.25rem)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Ellipsis className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1.5">
          <div className="flex flex-col">
            <PopoverClose
              onClick={() => active && onCloseOthers(active)}
              className="rounded-[calc(var(--radius)-0.25rem)] px-2.5 py-1.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
            >
              关闭其他
            </PopoverClose>
            <PopoverClose
              onClick={onCloseAll}
              className="rounded-[calc(var(--radius)-0.25rem)] px-2.5 py-1.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
            >
              关闭全部
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// AdminLayout = 中后台应用骨架：侧栏(品牌 + NavMenu·可折叠) + 顶栏(折叠触发 + 面包屑 + 扩展区)
// + 多页签导航(keep-alive 风格·开/切/关 + 关闭其他/全部) + 内容区。页签可受控(接路由)或非受控(菜单点击自动维护)。
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
  showTabs = true,
  tabs: tabsProp,
  activeKey: activeKeyProp,
  defaultActiveKey,
  onTabChange,
  onTabClose,
  breadcrumb,
  headerExtra,
  children,
  className,
  contentClassName,
}: AdminLayoutProps) {
  const leaves = useMemo(() => collectLeaves(menuItems, new Map()), [menuItems]);

  const [collapsedI, setCollapsedI] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? collapsedI;
  const setCollapsed = (v: boolean) => {
    if (collapsedProp === undefined) setCollapsedI(v);
    onCollapsedChange?.(v);
  };

  const [selectedI, setSelectedI] = useState<string | undefined>(defaultSelectedKey ?? defaultActiveKey);
  const selected = selectedKeyProp ?? selectedI;

  const tabsControlled = tabsProp !== undefined;
  const [tabsI, setTabsI] = useState<AdminTab[]>(() => {
    const k = defaultActiveKey ?? defaultSelectedKey;
    return k && leaves.has(k) ? [{ key: k, label: leaves.get(k)!.label }] : [];
  });
  const tabs = tabsControlled ? tabsProp! : tabsI;

  const [activeI, setActiveI] = useState<string | undefined>(defaultActiveKey ?? defaultSelectedKey);
  const active = activeKeyProp ?? activeI;

  const setActive = (key: string) => {
    if (activeKeyProp === undefined) setActiveI(key);
    if (selectedKeyProp === undefined) setSelectedI(key);
    onTabChange?.(key);
  };

  const handleMenuSelect = (key: string, item: NavMenuItem) => {
    if (!tabsControlled) {
      setTabsI((prev) => (prev.some((t) => t.key === key) ? prev : [...prev, { key, label: item.label }]));
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

  const closeOthers = (key: string) => {
    if (!tabsControlled) setTabsI((prev) => prev.filter((t) => t.key === key));
    setActive(key);
  };

  // 关闭全部：保留当前激活页签（避免内容区空白；中后台常保留首页/当前页）。
  const closeAll = () => {
    if (active) closeOthers(active);
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
    <div className={cn("flex h-full min-h-0 w-full bg-bg text-foreground", className)}>
      <aside data-collapsed={collapsed || undefined} style={siderStyle} className="flex flex-col border-r border-border bg-surface">
        <div className="flex h-16 shrink-0 items-center gap-2 overflow-hidden border-b border-border px-4 font-semibold">
          {collapsed ? (logoCollapsed ?? logo) : logo}
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
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
          <button
            type="button"
            aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
            className="inline-grid size-9 shrink-0 place-items-center rounded-[var(--radius)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1 truncate">{breadcrumb}</div>
          {headerExtra != null && <div className="flex shrink-0 items-center gap-2">{headerExtra}</div>}
        </header>

        {showTabs && tabs.length > 0 && (
          <TabBar
            tabs={tabs}
            active={active}
            onActivate={setActive}
            onClose={closeTab}
            onCloseOthers={closeOthers}
            onCloseAll={closeAll}
          />
        )}

        <main className={cn("min-h-0 min-w-0 flex-1 overflow-auto bg-bg p-4 sm:p-6", contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
