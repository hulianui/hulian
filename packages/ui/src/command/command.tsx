"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "../_icons";
import { cn } from "../lib/cn";
import { Empty } from "../empty";
import { overlayTransitions } from "../motion";
import type { CommandItemData, CommandProps } from "./command.types";

// 模态外壳复用瑚琏 Dialog 引擎（Base UI Dialog：Portal + Backdrop + Popup + focus-trap + Esc + 点外关闭），
// 同 drawer.tsx 装配；overlay 自管 mount/unmount，用 motion token CSS 镜像驱动原生过渡，零 motion 运行时。
//
// 命令面板刻意「无位移、更快」：它是键盘高频入口（⌘K 一天可开数十上百次），
// 位移/缩放进场会让每一次唤起都显得慢半拍——与其他 overlay 的 base(200ms)+scale 不同，
// 这里只留 fast(150ms) 的 opacity，既不从"无"硬闪出来，也不拖住高频动作。
// 外壳皮肤与布局分家（#178）：填充/描边/阴影收进这支 CVA，尺寸与定位留在 Popup 的类串里。
// 混在同一串时，消费方为了换个底色必须连 w-[min(92vw,40rem)] 这类布局类一起承担 twMerge 的
// 不确定性；分开后 `surface="none"` 就是「库不画、我来画」，皮肤升级不会和覆盖打架。
const shellVariants = cva("", {
  variants: {
    surface: {
      solid: "border border-hairline bg-surface shadow-xl",
      // glass 依赖身后有底图才出效果；没有底图时退化成半透明面板，不会糊成一片（同 AppLauncher 配方）。
      glass: "border border-hairline bg-surface/70 shadow-xl backdrop-blur-2xl",
      none: "",
    },
  },
  defaultVariants: { surface: "solid" },
});

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
  onQueryChange,
  closeOnSelect = true,
  autoHighlight = true,
  emptyMessage = "无匹配结果",
  footer,
  shortcut = false,
  surface = "solid",
  className,
  backdropClassName,
  "aria-label": ariaLabel = "命令面板",
}: CommandProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const [query, setQuery] = useState("");
  // active = -1 表示无高亮（autoHighlight={false}、或过滤后一项可用的都没有）。
  const [active, setActive] = useState(-1);
  // 高亮项的 value 快照：索引会随过滤变、数组引用更不可靠，跨批次找回原项只能认 value。
  const activeValueRef = useRef<string | undefined>(undefined);
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

  // onQueryChange 用 ref 持最新引用：它只是「把内部态播出去」的通知口，
  // 不该因消费方每渲染新建一个箭头函数就重跑下面的清空 effect。
  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;

  const updateQuery = (next: string) => {
    setQuery(next);
    onQueryChangeRef.current?.(next);
  };

  // 每次打开清空搜索（关闭→打开拿到干净面板）。清空同样要播出去，
  // 否则消费方自管的 groups 会停在上一次的搜索词上。
  useEffect(() => {
    if (open) {
      setQuery("");
      onQueryChangeRef.current?.("");
      // 上一次会话停在哪一项与这次要做什么无关 → 清掉记忆，让下面的默认高亮重新落位。
      activeValueRef.current = undefined;
    }
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

  // 默认高亮首个可用项（#174）：命令面板的核心路径是「打字 → 回车」，没有默认高亮这条路是断的 ——
  // execute(-1) 在 `!it` 处静默返回，用户看到的是「回车什么也没发生」，而没有高亮在视觉上很像
  // 「还没选」，很容易被当成自己点错了。对齐 cmdk / Raycast / VS Code 的通行行为。
  //
  // 换一批结果时**按 value 找回原高亮项**，而不是按数组引用重置：flatItems 依赖 groups，消费方
  // 只要没把 groups 用 useMemo 包稳（items 来自请求数据时非常常见），父级每次重渲染都会给出新数组，
  // 按引用重置会把刚点亮的项抹掉 —— 表现成「刚点亮就没了、回车时灵时不灵」。
  useEffect(() => {
    if (!open) return;
    const prev = activeValueRef.current;
    const kept =
      prev === undefined ? -1 : flatItems.findIndex((it) => it.value === prev && !it.disabled);
    const next = kept >= 0 ? kept : autoHighlight ? flatItems.findIndex((it) => !it.disabled) : -1;
    setActive(next);
    activeValueRef.current = next < 0 ? undefined : flatItems[next]?.value;
  }, [flatItems, autoHighlight, open]);

  // 高亮项滚动进视口。
  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // 点亮某项：state 与 value 快照必须同时更新，否则下一批结果会把高亮拉回旧项。
  const highlight = (i: number) => {
    setActive(i);
    activeValueRef.current = i < 0 ? undefined : flatItems[i]?.value;
  };

  const stepActive = (dir: 1 | -1) => {
    const n = flatItems.length;
    if (n === 0) return;
    // 从「无高亮」(active=-1) 起步：↓ 落首项、↑ 落末项。
    let i = active < 0 ? (dir === 1 ? -1 : 0) : active;
    for (let s = 0; s < n; s++) {
      i = (i + dir + n) % n;
      if (!flatItems[i]?.disabled) {
        highlight(i);
        return;
      }
    }
  };

  const edgeActive = (dir: 1 | -1) => {
    const order = flatItems.map((_, i) => i);
    if (dir === -1) order.reverse();
    const i = order.find((idx) => !flatItems[idx].disabled);
    if (i !== undefined) highlight(i);
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
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            backdropClassName,
          )}
          style={overlayTransitions.fade}
        />
        <BaseDialog.Popup
          initialFocus={inputRef}
          className={cn(
            // 布局与尺寸（恒定）
            "fixed left-1/2 top-[15vh] z-50 flex max-h-[70vh] w-[min(92vw,40rem)] -translate-x-1/2 flex-col overflow-hidden rounded-[var(--radius)] text-foreground outline-none",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            // 皮肤（可换）
            shellVariants({ surface }),
            className,
          )}
          style={overlayTransitions.fade}
        >
          <BaseDialog.Title className="sr-only">{ariaLabel}</BaseDialog.Title>

          {/* 搜索框（combobox） */}
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
                    <div id={`${baseId}-grp-${gi}`} className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
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
                          highlight(i);
                          execute(i);
                        }}
                        onMouseMove={() => {
                          if (!it.disabled && !isActive) highlight(i);
                        }}
                        className={cn(
                          "flex cursor-pointer select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-2 text-sm outline-none",
                          it.disabled
                            ? "cursor-not-allowed text-muted-foreground opacity-50"
                            : isActive
                              ? "bg-primary/12 text-primary"
                              : "text-foreground",
                        )}
                      >
                        {it.icon && <span className="shrink-0 [&_svg]:size-4">{it.icon}</span>}
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">{it.label}</span>
                          {it.description != null && (
                            <span className="truncate text-xs text-muted-foreground">{it.description}</span>
                          )}
                        </span>
                        {it.shortcut != null && <span className="shrink-0 text-xs text-muted-foreground">{it.shortcut}</span>}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* 页脚在列表之外：不参与列表滚动，故「模式切换 / 提示 / 计数」不会被列表滚动或换一批结果顶走
              （与 ComboboxContent.footer 同口径）。分隔线与顶部搜索框的 border-b 对称；
              内部只给版式（分隔线 + 内边距 + 面板自身的 text-sm 字号），布局与配色由页脚内容自己定。 */}
          {footer != null && (
            <div className="shrink-0 border-t border-border px-3 py-2 text-sm">{footer}</div>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
