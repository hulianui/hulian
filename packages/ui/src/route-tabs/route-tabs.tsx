"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "../_icons";
import { useLocaleValue } from "../config/locale-context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../context-menu";
import { cn } from "../lib/cn";
import { affectedKeys, isClosable, orderTabs, reorderTabs } from "./route-tabs-core";
import type { RouteTabsAction, RouteTabsProps } from "./route-tabs.types";

// 路由页签条：中后台「多标签工作区」的那条页签栏，从 AdminLayout 里抽出来单独可用
//（消费方要么用 AdminLayout 的内置版，要么自己搭骨架时直接用这个）。
//
// 设计上是**完全受控**的：items 不归组件，批量动作只把「这次实际会关掉哪些 key」算好交出去。
// 此前 AdminLayout 内置的那版在受控模式下「关闭其他/全部」只调了 setActive、没有对外回调，
// 于是点了看着毫无反应 —— 这是把状态所有权说清楚就能根治的一类 bug。

const ALL_ACTIONS: RouteTabsAction[] = [
  "close",
  "closeOthers",
  "closeLeft",
  "closeRight",
  "closeAll",
  "refresh",
];

const scrollBtn =
  "grid size-7 shrink-0 place-items-center rounded-[calc(var(--radius)-0.25rem)] text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

export function RouteTabs({
  items,
  activeKey,
  onChange,
  onClose,
  onAction,
  actions = ALL_ACTIONS,
  extraMenuItems,
  onExtraAction,
  sortable = false,
  onReorder,
  disableAutoScroll = false,
  className,
}: RouteTabsProps) {
  const loc = useLocaleValue("adminLayout", {
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
  const ordered = orderTabs(items);

  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLElement>());
  const [overflowing, setOverflowing] = useState(false);

  // 激活项滚入视口：页签一多，用键盘/路由切过去的那个常常在视口外，用户以为没切成功。
  // `?.()` 不是多余的：jsdom 没实现 scrollIntoView，直接调会让**任何消费方**的组件测试整个崩掉，
  // 而崩点在库内部、栈顶看不出跟页签有关。
  useEffect(() => {
    if (disableAutoScroll || !activeKey) return;
    tabRefs.current.get(activeKey)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [activeKey, disableAutoScroll]);

  // 是否溢出决定左右滚动按钮出不出。用 ResizeObserver 跟随容器与内容变化。
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  const scrollBy = (delta: number) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const runAction = (action: RouteTabsAction, tabKey: string) => {
    if (action === "close") {
      onClose?.(tabKey);
      return;
    }
    onAction?.(action, tabKey, affectedKeys(action, tabKey, items));
  };

  // —— 拖拽调序（原生 HTML5，与 Tree 同法；不引 dnd-kit）——
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ key: string; before: boolean } | null>(null);
  const sortEnabled = sortable && Boolean(onReorder);

  const dragProps = (key: string) =>
    sortEnabled
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            setDragKey(key);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", key);
          },
          onDragEnd: () => {
            setDragKey(null);
            setDropHint(null);
          },
          onDragOver: (e: React.DragEvent) => {
            if (!dragKey || dragKey === key) return;
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            // 横向页签按左右半区判前后（不是上下）
            const before = Number.isFinite(e.clientX)
              ? e.clientX - rect.left < rect.width / 2
              : true;
            setDropHint((prev) =>
              prev?.key === key && prev.before === before ? prev : { key, before },
            );
          },
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            const from = dragKey;
            const hint = dropHint;
            setDragKey(null);
            setDropHint(null);
            if (!from || !hint) return;
            onReorder?.(reorderTabs(items, from, hint.key, hint.before));
          },
        }
      : {};

  const menuItems = actions.filter((a) => ALL_ACTIONS.includes(a));
  const actionLabel: Record<RouteTabsAction, string> = {
    close: loc.closeTab,
    closeOthers: loc.closeOthers,
    closeLeft: loc.closeLeft,
    closeRight: loc.closeRight,
    closeAll: loc.closeAll,
    refresh: loc.refreshTab,
  };

  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center gap-1 border-b border-border bg-surface px-2",
        className,
      )}
    >
      {overflowing && (
        <button
          type="button"
          aria-label={loc.scrollLeft}
          onClick={() => scrollBy(-200)}
          className={scrollBtn}
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        role="tablist"
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scroll-smooth"
      >
        {ordered.map((t) => {
          const isActive = t.key === activeKey;
          const closable = isClosable(t, items);
          // refresh 恒可用；其余动作按「算出来有没有东西可关」决定是否禁用
          const disabledOf = (a: RouteTabsAction) =>
            a === "refresh" ? false : affectedKeys(a, t.key, items).length === 0;

          return (
            <ContextMenu key={t.key}>
              <ContextMenuTrigger
                render={
                  <div
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    ref={(el: HTMLElement | null) => {
                      if (el) tabRefs.current.set(t.key, el);
                      else tabRefs.current.delete(t.key);
                    }}
                    onClick={() => onChange?.(t.key)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange?.(t.key);
                      }
                    }}
                    {...dragProps(t.key)}
                    className={cn(
                      "group relative flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius)-0.25rem)] pl-3 text-sm whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      closable ? "pr-1.5" : "pr-3",
                      isActive
                        ? "bg-primary/12 text-primary"
                        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                      dragKey === t.key && "opacity-50",
                      dropHint?.key === t.key &&
                        (dropHint.before
                          ? "before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-primary before:content-['']"
                          : "after:absolute after:inset-y-1 after:right-0 after:w-0.5 after:bg-primary after:content-['']"),
                    )}
                  >
                    {t.icon ? (
                      <span aria-hidden className="shrink-0 [&>svg]:size-3.5">
                        {t.icon}
                      </span>
                    ) : isActive ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    ) : null}
                    <span className="truncate">{t.label}</span>
                    {closable && (
                      <button
                        type="button"
                        aria-label={loc.closeTab}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose?.(t.key);
                        }}
                        className="inline-flex size-4 items-center justify-center rounded-full opacity-50 transition-opacity hover:bg-surface-hover hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                }
              />
              <ContextMenuContent className="w-40">
                {menuItems.map((a) => (
                  <ContextMenuItem
                    key={a}
                    disabled={disabledOf(a)}
                    onClick={() => runAction(a, t.key)}
                  >
                    {actionLabel[a]}
                  </ContextMenuItem>
                ))}
                {extraMenuItems?.map((m) => (
                  <ContextMenuItem
                    key={m.key}
                    disabled={m.disabled}
                    onClick={() => onExtraAction?.(m.key, t.key)}
                  >
                    {m.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {overflowing && (
        <button
          type="button"
          aria-label={loc.scrollRight}
          onClick={() => scrollBy(200)}
          className={scrollBtn}
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
