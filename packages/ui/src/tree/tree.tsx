"use client";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Checkbox } from "../checkbox";
import {
  buildIndex,
  computeChecked,
  filterTree,
  flattenVisible,
  getCheckState,
  normalizeCheckedToLeaves,
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
  showLine = false,
  searchable = false,
  searchPlaceholder = "搜索",
  className,
  "aria-label": ariaLabel = "树",
}: TreeProps) {
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
  const leafSet = useMemo(() => normalizeCheckedToLeaves(checkedInput, index), [checkedInput, index]);
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
    activeKey && flatKeys.includes(activeKey) ? activeKey : (firstSelected ?? flatKeys[0] ?? null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const focusKey = (key: string) => {
    setActiveKey(key);
    itemRefs.current.get(key)?.focus();
  };

  const activate = (row: FlatRow) => {
    if (row.disabled) return;
    if (row.hasChildren) {
      toggleExpand(row.key, !row.expanded);
    } else if (checkable) {
      onToggleCheck(row.key);
    } else if (selectable) {
      setSelected(row.key);
    }
  };

  const typeahead = (char: string, from: number) => {
    const c = char.toLowerCase();
    const text = (r: FlatRow) => (typeof r.node.label === "string" ? r.node.label : r.key).toLowerCase();
    for (let n = 1; n <= flat.length; n++) {
      const i = (from + n) % flat.length;
      if (!flat[i].disabled && text(flat[i]).startsWith(c)) return i;
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
              checkable ? (checkState === "indeterminate" ? "mixed" : checkState === "checked") : undefined
            }
            aria-disabled={node.disabled || undefined}
            tabIndex={isActive && !node.disabled ? 0 : -1}
            onFocus={() => setActiveKey(node.key)}
            onClick={() => {
              if (node.disabled) return;
              setActiveKey(node.key);
              if (hasChildren) toggleExpand(node.key, !isExpanded);
              else if (checkable) onToggleCheck(node.key);
              else if (selectable) setSelected(node.key);
            }}
            style={{ paddingLeft: `calc(0.5rem + ${depth} * 1.25rem)` }}
            data-selected={!checkable && isSelected ? "" : undefined}
            className={cn(
              "group/row relative flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm outline-none transition-colors",
              "text-foreground hover:bg-surface-hover",
              "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              !checkable && "data-[selected]:bg-primary/12 data-[selected]:font-medium data-[selected]:text-primary",
              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
              showLine && "tree-line",
            )}
          >
            <span className="flex size-4 shrink-0 items-center justify-center text-muted">
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

  // 搜索态：平铺渲染过滤后的 flat 行（命中高亮，不走嵌套过渡）。
  const renderFlatSearch = () =>
    flat.map((row) => {
      const node = row.node;
      const hasChildren = row.hasChildren;
      const checkState = checkable ? getCheckState(node.key, leafSet, index) : "unchecked";
      const isActive = node.key === effectiveActive;
      return (
        <li key={node.key} role="none">
          <div
            role="treeitem"
            ref={(el) => {
              if (el) itemRefs.current.set(node.key, el);
              else itemRefs.current.delete(node.key);
            }}
            aria-level={row.depth + 1}
            aria-expanded={hasChildren ? row.expanded : undefined}
            aria-checked={
              checkable ? (checkState === "indeterminate" ? "mixed" : checkState === "checked") : undefined
            }
            aria-disabled={node.disabled || undefined}
            tabIndex={isActive && !node.disabled ? 0 : -1}
            onFocus={() => setActiveKey(node.key)}
            onClick={() => {
              if (node.disabled) return;
              setActiveKey(node.key);
              if (hasChildren) toggleExpand(node.key, !row.expanded);
              else if (checkable) onToggleCheck(node.key);
              else if (selectable) setSelected(node.key);
            }}
            style={{ paddingLeft: `calc(0.5rem + ${row.depth} * 1.25rem)` }}
            className={cn(
              "flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm outline-none transition-colors",
              "text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              matchedKeys.has(node.key) && "font-medium text-primary",
              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
            )}
          >
            <span className="size-4 shrink-0" aria-hidden />
            {checkable ? checkboxFor(node, checkState) : null}
            <span className="truncate">{node.label}</span>
          </div>
        </li>
      );
    });

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
      <ul
        role="tree"
        aria-label={ariaLabel}
        aria-multiselectable={checkable || undefined}
        onKeyDown={onKeyDown}
        className="flex flex-col"
      >
        {searching ? renderFlatSearch() : renderTree(nodes, 0, [])}
      </ul>
      {searching && flat.length === 0 ? (
        <div className="px-2 py-6 text-center text-sm text-muted">无匹配项</div>
      ) : null}
    </div>
  );
}
