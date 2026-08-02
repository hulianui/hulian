"use client";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useReducedMotion } from "motion/react";
import { Search } from "../_icons";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Checkbox } from "../checkbox";
import {
  buildIndex,
  computeChecked,
  filterTree,
  flattenVisible,
  canDropOn,
  getCheckState,
  nodeSearchText,
  normalizeCheckedToLeaves,
  resolveDropPosition,
  type DropPosition,
  toggleChecked,
  type FlatRow,
  type TreeNode,
} from "./tree-core";
import type { TreeProps } from "./tree.types";

// 自研递归树（WAI-ARIA tree pattern · 零依赖）：roving tabindex + 方向键/Home/End/typeahead +
// 展开 grid-rows 过渡 + 可选 checkable 父子级联 + 连接线 + 搜索。复用 nav-menu/listbox 范式肌肉，不重构它们。
export function Tree({
  nodes,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  selectable = true,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelect,
  checkable = false,
  checkedKeys,
  defaultCheckedKeys = [],
  onCheck,
  expandTrigger = "row",
  draggable = false,
  onDrop,
  allowDropInside,
  virtual = false,
  showLine = false,
  searchable = false,
  searchPlaceholder: searchPlaceholderProp,
  className,
  "aria-label": ariaLabelProp,
}: TreeProps) {
  const labels = {
    label: "树",
    searchPlaceholder: "搜索",
    noMatches: "无匹配项",
    ...useComponentLocale().tree,
  };
  const searchPlaceholder = searchPlaceholderProp ?? labels.searchPlaceholder;
  const ariaLabel = ariaLabelProp ?? labels.label;
  // "row"：有子节点的行点了只展开（历史默认）。"icon"：只有箭头管展开，行归 select/check，
  // 于是父节点也能被选中。
  const rowClickExpands = expandTrigger === "row";
  const reduced = useReducedMotion();
  const index = useMemo(() => buildIndex(nodes), [nodes]);

  // —— 展开态（受控/非受控）——
  const [expandedState, setExpandedState] = useState<string[]>(defaultExpandedKeys);
  const expanded = expandedKeys ?? expandedState;
  const setExpanded = (next: string[]) => {
    if (expandedKeys === undefined) setExpandedState(next);
    onExpandedChange?.(next);
  };
  const toggleExpand = (key: string, next: boolean) => {
    const set = new Set(expanded);
    if (next) set.add(key);
    else set.delete(key);
    setExpanded([...set]);
  };

  // —— 选中态（受控/非受控）——
  const [selectedState, setSelectedState] = useState<string[]>(defaultSelectedKeys);
  const selected = selectedKeys ?? selectedState;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const setSelected = (key: string) => {
    if (selectedKeys === undefined) setSelectedState([key]);
    const node = index.nodeMap.get(key);
    if (node) onSelect?.([key], node);
  };

  // —— 勾选态（叶为真源；受控入参归一为叶集）——
  const [checkedState, setCheckedState] = useState<string[]>(defaultCheckedKeys);
  const checkedInput = checkedKeys ?? checkedState;
  const leafSet = useMemo(
    () => normalizeCheckedToLeaves(checkedInput, index),
    [checkedInput, index],
  );
  const applyCheck = (key: string, nextLeaf: Set<string>) => {
    const payload = computeChecked(nextLeaf, index);
    if (checkedKeys === undefined) setCheckedState(payload.checkedKeys);
    const node = index.nodeMap.get(key);
    if (node) onCheck?.(payload, node);
  };
  const onToggleCheck = (key: string) => {
    const state = getCheckState(key, leafSet, index);
    const next = toggleChecked(key, state !== "checked", leafSet, index);
    applyCheck(key, next);
  };

  // —— 搜索（内部态）——
  const [query, setQuery] = useState("");
  const { matchedKeys, autoExpandKeys } = useMemo(() => filterTree(nodes, query), [nodes, query]);
  const searching = searchable && query.trim().length > 0;

  // 搜索时：展开集 = 自动展开命中路径；可见性按命中路径过滤。
  const effExpanded = searching ? autoExpandKeys : new Set(expanded);
  const allFlat = useMemo(() => flattenVisible(nodes, effExpanded), [nodes, effExpanded]);
  const flat = useMemo(() => {
    if (!searching) return allFlat;
    // 只保留命中节点或命中节点祖先的行
    return allFlat.filter((r) => matchedKeys.has(r.key) || autoExpandKeys.has(r.key));
  }, [allFlat, searching, matchedKeys, autoExpandKeys]);

  // —— roving tabindex ——
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const flatKeys = flat.map((r) => r.key);
  const firstSelected = flat.find((r) => selectedSet.has(r.key))?.key;
  const effectiveActive =
    activeKey && flatKeys.includes(activeKey) ? activeKey : firstSelected ?? flatKeys[0] ?? null;
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const focusKey = (key: string) => {
    setActiveKey(key);
    itemRefs.current.get(key)?.focus();
  };

  // 行动作（点击 / Enter / Space 共用一条）。
  // disabled 只挡 select/check，不挡展开——「不可选」不等于「不可浏览子树」，
  // 此前禁用节点连箭头都点不动，子树彻底不可达。
  const activateRow = (opts: {
    key: string;
    disabled: boolean;
    hasChildren: boolean;
    expanded: boolean;
    /** 搜索平铺态：展开由命中路径自动驱动，点击一律走 select/check。 */
    flatSearch?: boolean;
  }) => {
    const canExpandByRow = opts.hasChildren && rowClickExpands && !opts.flatSearch;
    if (canExpandByRow) {
      toggleExpand(opts.key, !opts.expanded);
      return;
    }
    if (opts.disabled) return;
    if (checkable) onToggleCheck(opts.key);
    else if (selectable) setSelected(opts.key);
  };

  const activate = (row: FlatRow) =>
    activateRow({
      key: row.key,
      disabled: row.disabled,
      hasChildren: row.hasChildren,
      expanded: row.expanded,
      flatSearch: searching,
    });

  const typeahead = (char: string, from: number) => {
    const c = char.toLowerCase();
    for (let n = 1; n <= flat.length; n++) {
      const i = (from + n) % flat.length;
      if (!flat[i].disabled && nodeSearchText(flat[i].node).startsWith(c)) return i;
    }
    return -1;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const idx = flat.findIndex((r) => r.key === effectiveActive);
    if (idx === -1) return;
    const row = flat[idx];
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (flat[idx + 1]) focusKey(flat[idx + 1].key);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (flat[idx - 1]) focusKey(flat[idx - 1].key);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (row.hasChildren && !row.expanded) toggleExpand(row.key, true);
        else if (row.expanded) {
          const child = flat[idx + 1];
          if (child && child.parentKey === row.key) focusKey(child.key);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (row.hasChildren && row.expanded) toggleExpand(row.key, false);
        else if (row.parentKey) focusKey(row.parentKey);
        break;
      }
      case "Home": {
        e.preventDefault();
        if (flat[0]) focusKey(flat[0].key);
        break;
      }
      case "End": {
        e.preventDefault();
        if (flat.at(-1)) focusKey(flat.at(-1)!.key);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        activate(row);
        break;
      }
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const i = typeahead(e.key, idx);
          if (i >= 0) focusKey(flat[i].key);
        }
    }
  };

  // —— 虚拟滚动 ——
  // hook 不可条件调用，故 virtualizer 恒声明；virtualOn=false 时它拿到 count=0、整段闲置。
  const virtualOpts = typeof virtual === "object" ? virtual : {};
  const virtualOn = virtual !== false && virtual != null;
  const virtualHeight = virtualOpts.height ?? 320;
  const itemHeight = virtualOpts.itemHeight ?? 36;
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: virtualOn ? flat.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => itemHeight,
    overscan: virtualOpts.overscan ?? 8,
  });

  // —— 拖拽排序（原生 HTML5 拖放）——
  // 不用 dnd-kit：Tree 只需要「拖一行、落到另一行的上/中/下」，原生事件足够，
  // 也免得不开拖拽的消费方白白背上一条 dnd-kit 运行时（Table 刚踩过这个坑）。
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ key: string; position: DropPosition } | null>(null);
  const dragEnabled = draggable && Boolean(onDrop);

  const endDrag = () => {
    setDragKey(null);
    setDropHint(null);
  };

  /** 拖拽相关的 DOM props；未开拖拽或该行不可拖时返回空对象（渲染结果与改造前一致）。 */
  const dragProps = (
    node: TreeNode,
  ): React.HTMLAttributes<HTMLElement> & { draggable?: boolean } => {
    if (!dragEnabled || node.disabled) return {};
    return {
      draggable: true,
      onDragStart: (e) => {
        setDragKey(node.key);
        // 不设 dataTransfer 的话 Firefox 根本不发起拖拽
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", node.key);
      },
      onDragEnd: endDrag,
      onDragOver: (e) => {
        if (dragKey == null) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const allowInside = allowDropInside ? allowDropInside(node) : true;
        const position = resolveDropPosition(e.clientY - rect.top, rect.height, allowInside);
        if (!canDropOn(index, dragKey, node.key, position)) {
          setDropHint(null);
          return;
        }
        // 只有 preventDefault 过的目标才会收到 drop —— 非法落点不 preventDefault，
        // 于是浏览器自己就显示「不可放置」光标，不必再自造禁止态
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropHint((prev) =>
          prev?.key === node.key && prev.position === position ? prev : { key: node.key, position },
        );
      },
      onDragLeave: () => setDropHint((prev) => (prev?.key === node.key ? null : prev)),
      onDrop: (e) => {
        e.preventDefault();
        e.stopPropagation();
        const hint = dropHint;
        const from = dragKey;
        endDrag();
        if (!from || !hint || hint.key !== node.key) return;
        if (!canDropOn(index, from, hint.key, hint.position)) return;
        onDrop?.({ dragKey: from, dropKey: hint.key, position: hint.position });
      },
    };
  };

  /** 落点指示：上/下沿画主色线，inside 画一圈内描边。 */
  const dropClass = (key: string) => {
    if (dropHint?.key !== key) return undefined;
    if (dropHint.position === "before")
      return "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary before:content-['']";
    if (dropHint.position === "after")
      return "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:content-['']";
    return "ring-2 ring-inset ring-primary";
  };

  const checkboxFor = (node: TreeNode, checkState: ReturnType<typeof getCheckState>) => (
    <span onClick={(e) => e.stopPropagation()} className="flex shrink-0">
      <Checkbox
        checked={checkState === "checked"}
        indeterminate={checkState === "indeterminate"}
        disabled={node.disabled}
        tabIndex={-1}
        onCheckedChange={() => onToggleCheck(node.key)}
      />
    </span>
  );

  // 递归渲染（展开过渡用 grid-rows）。搜索态走 renderFlatSearch 平铺。
  const renderTree = (list: TreeNode[], depth: number, ancestorIsLast: boolean[]) =>
    list.map((node, i) => {
      const isLast = i === list.length - 1;
      const hasChildren = !!node.children?.length;
      const isExpanded = hasChildren && effExpanded.has(node.key);
      const isSelected = selectedSet.has(node.key);
      const checkState = checkable ? getCheckState(node.key, leafSet, index) : "unchecked";
      const isActive = node.key === effectiveActive;
      const setRef = (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(node.key, el);
        else itemRefs.current.delete(node.key);
      };

      return (
        <li key={node.key} role="none">
          <div
            role="treeitem"
            ref={setRef}
            aria-level={depth + 1}
            aria-setsize={list.length}
            aria-posinset={i + 1}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={!checkable && isSelected ? true : undefined}
            aria-checked={
              checkable
                ? checkState === "indeterminate"
                  ? "mixed"
                  : checkState === "checked"
                : undefined
            }
            aria-disabled={node.disabled || undefined}
            tabIndex={isActive && !node.disabled ? 0 : -1}
            onFocus={() => setActiveKey(node.key)}
            onClick={() => {
              if (!node.disabled) setActiveKey(node.key);
              activateRow({
                key: node.key,
                disabled: Boolean(node.disabled),
                hasChildren,
                expanded: isExpanded,
              });
            }}
            {...dragProps(node)}
            style={{ paddingLeft: `calc(0.5rem + ${depth} * 1.25rem)` }}
            data-selected={!checkable && isSelected ? "" : undefined}
            className={cn(
              "group/row relative flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm outline-none transition-colors",
              "text-foreground",
              "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              !checkable &&
                "data-[selected]:bg-primary/12 data-[selected]:font-medium data-[selected]:text-primary",
              // 禁用行不再 pointer-events-none：它会连箭头一起废掉，子树彻底不可达。
              // 拦截改由 activateRow 内部做，这里只表达视觉。
              node.disabled ? "cursor-default opacity-50" : "hover:bg-surface-hover",
              dragEnabled && !node.disabled && "cursor-grab active:cursor-grabbing",
              dragKey === node.key && "opacity-50",
              dropClass(node.key),
              showLine && "tree-line",
            )}
          >
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- 箭头是鼠标可供性，
                键盘走方向键；treeitem 内不放可聚焦子元素（ARIA tree pattern 不允许）。 */}
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center text-muted",
                hasChildren && !rowClickExpands && "cursor-pointer hover:text-foreground",
              )}
              onClick={
                hasChildren && !rowClickExpands
                  ? (e) => {
                      e.stopPropagation(); // 别让行的 select 也跟着跑
                      toggleExpand(node.key, !isExpanded);
                    }
                  : undefined
              }
            >
              {hasChildren ? (
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ) : null}
            </span>
            {checkable ? checkboxFor(node, checkState) : null}
            {node.icon ? (
              <span aria-hidden className="shrink-0 text-muted [&>svg]:size-4">
                {node.icon}
              </span>
            ) : null}
            <span className="truncate">{node.label}</span>
          </div>

          {hasChildren && !searching ? (
            <div
              className={cn(
                "grid transition-[grid-template-rows]",
                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              style={{
                transitionDuration: reduced ? "0ms" : motionDurationCss.base,
                transitionTimingFunction: motionEaseCss.out,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <ul role="group" className="flex flex-col">
                  {renderTree(node.children!, depth + 1, [...ancestorIsLast, isLast])}
                </ul>
              </div>
            </div>
          ) : null}
        </li>
      );
    });

  /**
   * 平铺一行。两条路径共用：
   * - **搜索态**（`flatSearch`）：展开由命中路径自动驱动，点击一律 select/check，不画箭头。
   * - **虚拟滚动**：展开照常，画箭头；但没有嵌套 DOM，也就没有 grid-rows 过渡。
   */
  const renderFlatRow = (
    row: FlatRow,
    opts: { flatSearch: boolean; style?: React.CSSProperties },
  ) => {
    const node = row.node;
    const hasChildren = row.hasChildren;
    const checkState = checkable ? getCheckState(node.key, leafSet, index) : "unchecked";
    const isActive = node.key === effectiveActive;
    const isSelected = selectedSet.has(node.key);
    const showCaret = !opts.flatSearch;
    return (
      <li key={node.key} role="none" style={opts.style}>
        <div
          role="treeitem"
          ref={(el) => {
            if (el) itemRefs.current.set(node.key, el);
            else itemRefs.current.delete(node.key);
          }}
          aria-level={row.depth + 1}
          aria-expanded={hasChildren ? row.expanded : undefined}
          aria-selected={!checkable && isSelected ? true : undefined}
          aria-checked={
            checkable
              ? checkState === "indeterminate"
                ? "mixed"
                : checkState === "checked"
              : undefined
          }
          aria-disabled={node.disabled || undefined}
          tabIndex={isActive && !node.disabled ? 0 : -1}
          onFocus={() => setActiveKey(node.key)}
          onClick={() => {
            if (!node.disabled) setActiveKey(node.key);
            // 搜索平铺态下父节点同样可选（此前点父节点是切一个当下被忽略的 expanded 位，即毫无反应）。
            activateRow({
              key: node.key,
              disabled: Boolean(node.disabled),
              hasChildren,
              expanded: row.expanded,
              flatSearch: opts.flatSearch,
            });
          }}
          {...dragProps(node)}
          style={{ paddingLeft: `calc(0.5rem + ${row.depth} * 1.25rem)` }}
          data-selected={!checkable && isSelected ? "" : undefined}
          className={cn(
            "relative flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm outline-none transition-colors",
            "text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            opts.flatSearch && matchedKeys.has(node.key) && "font-medium text-primary",
            !checkable &&
              "data-[selected]:bg-primary/12 data-[selected]:font-medium data-[selected]:text-primary",
            node.disabled ? "cursor-default opacity-50" : "hover:bg-surface-hover",
            dragEnabled && !node.disabled && "cursor-grab active:cursor-grabbing",
            dragKey === node.key && "opacity-50",
            dropClass(node.key),
          )}
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center text-muted",
              showCaret &&
                hasChildren &&
                !rowClickExpands &&
                "cursor-pointer hover:text-foreground",
            )}
            onClick={
              showCaret && hasChildren && !rowClickExpands
                ? (e) => {
                    e.stopPropagation();
                    toggleExpand(node.key, !row.expanded);
                  }
                : undefined
            }
          >
            {showCaret && hasChildren ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("size-3.5 transition-transform", row.expanded && "rotate-90")}
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            ) : null}
          </span>
          {checkable ? checkboxFor(node, checkState) : null}
          {node.icon ? (
            <span aria-hidden className="shrink-0 text-muted [&>svg]:size-4">
              {node.icon}
            </span>
          ) : null}
          <span className="truncate">{node.label}</span>
        </div>
      </li>
    );
  };

  return (
    <div className={cn("w-full select-none text-foreground", className)}>
      {searchable ? (
        <div className="mb-2 flex h-9 items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-2.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-bg">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            aria-label={searchPlaceholder}
          />
        </div>
      ) : null}
      {virtualOn ? (
        // 虚拟滚动：只渲染视口内的行。代价是必须平铺（无嵌套 DOM）→ 没有展开过渡、连接线失效，
        // 已写进 tree.md 禁忌区。ul 需要 relative 才能承接 li 的绝对定位。
        <div ref={scrollRef} style={{ height: virtualHeight }} className="overflow-auto">
          <ul
            role="tree"
            aria-label={ariaLabel}
            aria-multiselectable={checkable || undefined}
            onKeyDown={onKeyDown}
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((v) =>
              renderFlatRow(flat[v.index], {
                flatSearch: searching,
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: v.size,
                  transform: `translateY(${v.start}px)`,
                },
              }),
            )}
          </ul>
        </div>
      ) : (
        <ul
          role="tree"
          aria-label={ariaLabel}
          aria-multiselectable={checkable || undefined}
          onKeyDown={onKeyDown}
          className="flex flex-col"
        >
          {searching
            ? flat.map((row) => renderFlatRow(row, { flatSearch: true }))
            : renderTree(nodes, 0, [])}
        </ul>
      )}
      {searching && flat.length === 0 ? (
        <div className="px-2 py-6 text-center text-sm text-muted">{labels.noMatches}</div>
      ) : null}
    </div>
  );
}
