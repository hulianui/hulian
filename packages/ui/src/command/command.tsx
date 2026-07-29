"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "../_icons";
import { cn } from "../lib/cn";
import { Empty } from "../empty";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { CommandItemData, CommandProps } from "./command.types";

// 模态外壳复用瑚琏 Dialog 引擎（Base UI Dialog：Portal + Backdrop + Popup + focus-trap + Esc + 点外关闭），
// 同 drawer.tsx 装配；overlay 自管 mount/unmount，用 motion token CSS 镜像驱动原生过渡，零 motion 运行时。
// transition 用简写：Base UI 过渡期会往内联 style 注入 transition 简写，与长写混用会触发 React 警告并丢弃长写。
//
// 命令面板刻意「无位移、更快」：它是键盘高频入口（⌘K 一天可开数十上百次），
// 位移/缩放进场会让每一次唤起都显得慢半拍——与其他 overlay 的 base(200ms)+scale 不同，
// 这里只留 fast(150ms) 的 opacity，既不从"无"硬闪出来，也不拖住高频动作。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.fast} ${motionEaseCss.out}`,
} as const;

// 默认过滤：大小写不敏感子串匹配 keywords + 字符串型 label + value。
function defaultFilter(item: CommandItemData, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [item.keywords ?? "", typeof item.label === "string" ? item.label : "", item.value]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

/**
 * 全局快捷键 ⌘K / Ctrl+K → 触发回调（消费者自绑用）。
 * Command 内置 `shortcut` prop 走同款逻辑但作切换；此 hook 供更灵活的外部绑定。
 */
export function useCommandShortcut(onTrigger: () => void) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onTrigger();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onTrigger]);
}

// Command = combobox 模式：焦点恒留在搜索框，方向键移动 aria-activedescendant 高亮项（非 Listbox 的
// roving-tabindex —— 那会把焦点移出输入框、打断输入）。复用 Listbox 的「跳过禁用项 step/edge」导航语义 +
// WAI-ARIA listbox/option 语义，但以 activedescendant 实现。含状态/键盘交互故 "use client"。
export function Command({
  open,
  onOpenChange,
  groups,
  placeholder = "输入命令或搜索…",
  filter = defaultFilter,
  onSelectItem,
  closeOnSelect = true,
  emptyMessage = "无匹配结果",
  shortcut = false,
  className,
  "aria-label": ariaLabel = "命令面板",
}: CommandProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const [query, setQuery] = useState("");
  // active = -1 表示无高亮（无默认高亮：仅方向键/鼠标移入才点亮某项）。
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 内置快捷键（可选）：⌘K/Ctrl+K 切换开合。条件分支放 effect 内（不可条件调用 hook）。
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, open, onOpenChange]);

  // 每次打开清空搜索（关闭→打开拿到干净面板）。
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  // 过滤后的分组 + 跨组展平项（active 索引在展平序上漫游，支持跨组上下移动）。
  const { visibleGroups, flatItems } = useMemo(() => {
    const flat: CommandItemData[] = [];
    const vg = groups
      .map((g) => ({ heading: g.heading, items: g.items.filter((it) => filter(it, query)) }))
      .filter((g) => g.items.length > 0);
    vg.forEach((g) => g.items.forEach((it) => flat.push(it)));
    return { visibleGroups: vg, flatItems: flat };
  }, [groups, query, filter]);

  // 过滤结果变化 → 清空高亮（无默认高亮，回到「未点亮」态）。
  useEffect(() => {
    setActive(-1);
  }, [flatItems]);

  // 高亮项滚动进视口。
  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const stepActive = (dir: 1 | -1) => {
    const n = flatItems.length;
    if (n === 0) return;
    // 从「无高亮」(active=-1) 起步：↓ 落首项、↑ 落末项。
    let i = active < 0 ? (dir === 1 ? -1 : 0) : active;
    for (let s = 0; s < n; s++) {
      i = (i + dir + n) % n;
      if (!flatItems[i]?.disabled) {
        setActive(i);
        return;
      }
    }
  };

  const edgeActive = (dir: 1 | -1) => {
    const order = flatItems.map((_, i) => i);
    if (dir === -1) order.reverse();
    const i = order.find((idx) => !flatItems[idx].disabled);
    if (i !== undefined) setActive(i);
  };

  const execute = (i: number) => {
    const it = flatItems[i];
    if (!it || it.disabled) return;
    it.onSelect?.(it.value);
    onSelectItem?.(it.value);
    if (closeOnSelect) onOpenChange(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        stepActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        stepActive(-1);
        break;
      case "Home":
        e.preventDefault();
        edgeActive(1);
        break;
      case "End":
        e.preventDefault();
        edgeActive(-1);
        break;
      case "Enter":
        e.preventDefault();
        execute(active);
        break;
      // Esc 关闭交给 Base UI Dialog（不在此 preventDefault）。
    }
  };

  const activeId = active >= 0 && flatItems.length ? `${baseId}-opt-${active}` : undefined;
  let flatIdx = -1; // 渲染时与 flatItems 同序递增，得到每项的展平索引（驱动 id/ref/高亮）。

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          style={overlayTransition}
        />
        <BaseDialog.Popup
          initialFocus={inputRef}
          className={cn(
            "fixed left-1/2 top-[15vh] z-50 flex max-h-[70vh] w-[min(92vw,40rem)] -translate-x-1/2 flex-col overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface text-foreground shadow-xl outline-none",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          <BaseDialog.Title className="sr-only">{ariaLabel}</BaseDialog.Title>

          {/* 搜索框（combobox） */}
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted" aria-hidden />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={true}
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-label={ariaLabel}
              autoComplete="off"
              spellCheck={false}
              value={query}
              placeholder={placeholder}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
          </div>

          {/* 过滤列表 */}
          <div id={listId} role="listbox" aria-label={ariaLabel} className="flex-1 overflow-y-auto p-1">
            {flatItems.length === 0 ? (
              <Empty size="sm" title={emptyMessage} />
            ) : (
              visibleGroups.map((g, gi) => (
                <div
                  key={gi}
                  role="group"
                  aria-labelledby={g.heading != null ? `${baseId}-grp-${gi}` : undefined}
                  className="mb-1 last:mb-0"
                >
                  {g.heading != null && (
                    <div id={`${baseId}-grp-${gi}`} className="px-2 pb-1 pt-2 text-xs font-medium text-muted">
                      {g.heading}
                    </div>
                  )}
                  {g.items.map((it) => {
                    flatIdx += 1;
                    const i = flatIdx;
                    const isActive = i === active;
                    return (
                      <div
                        key={it.value}
                        id={`${baseId}-opt-${i}`}
                        ref={(el) => {
                          itemRefs.current[i] = el;
                        }}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={it.disabled || undefined}
                        onClick={() => {
                          if (it.disabled) return;
                          setActive(i);
                          execute(i);
                        }}
                        onMouseMove={() => {
                          if (!it.disabled && !isActive) setActive(i);
                        }}
                        className={cn(
                          "flex cursor-pointer select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-2 text-sm outline-none",
                          it.disabled
                            ? "cursor-not-allowed text-muted opacity-50"
                            : isActive
                              ? "bg-primary/12 text-primary"
                              : "text-foreground",
                        )}
                      >
                        {it.icon && <span className="shrink-0 [&_svg]:size-4">{it.icon}</span>}
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">{it.label}</span>
                          {it.description != null && (
                            <span className="truncate text-xs text-muted">{it.description}</span>
                          )}
                        </span>
                        {it.shortcut != null && <span className="shrink-0 text-xs text-muted">{it.shortcut}</span>}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
