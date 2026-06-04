"use client";
import { useMemo, useState } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cva } from "class-variance-authority";
import { ChevronRight } from "../_icons";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { getNodePath, type TreeNode } from "../tree/tree-core";
import { flattenLeafPaths, filterLeafPaths } from "./cascader.logic";
import type { CascaderProps } from "./cascader.types";

const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const triggerVariants = cva(
  [
    "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[popup-open]:border-ring",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-3.5 text-base" },
    },
    defaultVariants: { size: "md" },
  },
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 从 nodes 沿 activePath 取每一列要显示的 list（列 0 = 根，列 n = activePath[n-1] 的子）。
function columnsOf(nodes: TreeNode[], activePath: string[]): TreeNode[][] {
  const cols: TreeNode[][] = [nodes];
  let list = nodes;
  for (const key of activePath) {
    const node = list.find((n) => n.key === key);
    if (!node?.children?.length) break;
    cols.push(node.children);
    list = node.children;
  }
  return cols;
}

export function Cascader({
  nodes,
  value,
  defaultValue = [],
  onChange,
  expandTrigger = "click",
  changeOnSelect = false,
  showSearch = false,
  searchPlaceholder = "搜索…",
  placeholder = "请选择",
  disabled,
  invalid,
  size = "md",
  className,
}: CascaderProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const current = value ?? internal;

  // 浮层内的「正在浏览」路径（区别于已提交 value）；打开时以 value 初始化。
  const [activePath, setActivePath] = useState<string[]>(current);

  // 搜索态：showSearch 时浮层顶部出输入框；query 非空则用扁平结果替代逐级列。
  const [query, setQuery] = useState("");
  const leafPaths = useMemo(() => (showSearch ? flattenLeafPaths(nodes) : []), [showSearch, nodes]);
  const results = useMemo(() => (query ? filterLeafPaths(leafPaths, query) : []), [leafPaths, query]);
  const searching = showSearch && query.trim().length > 0;

  const cols = useMemo(() => columnsOf(nodes, activePath), [nodes, activePath]);
  const triggerLabel = useMemo(() => {
    if (!current.length) return null;
    const path = getNodePath(nodes, current[current.length - 1]);
    return path
      .map((n) => n.label)
      .reduce<React.ReactNode[]>((acc, l, i) => (i ? [...acc, " / ", l] : [l]), []);
  }, [nodes, current]);

  const commit = (path: string[]) => {
    const nodePath = path
      .map((k) => {
        const p = getNodePath(nodes, k);
        return p[p.length - 1];
      })
      .filter(Boolean) as TreeNode[];
    if (value === undefined) setInternal(path);
    onChange?.(path, nodePath);
  };

  const onPick = (colIndex: number, node: TreeNode) => {
    if (node.disabled) return;
    const nextPath = [...activePath.slice(0, colIndex), node.key];
    setActivePath(nextPath);
    const hasChildren = !!node.children?.length;
    if (!hasChildren) {
      commit(nextPath);
      setOpen(false);
    } else if (changeOnSelect) {
      commit(nextPath);
    }
  };

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setActivePath(current); // 打开时同步浏览路径到已提交值
        if (!o) setQuery(""); // 关闭清空搜索，下次打开回到浏览态
      }}
    >
      <BasePopover.Trigger
        disabled={disabled}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className={cn(triggerVariants({ size }), className)}
      >
        <span className={cn("truncate text-left", !triggerLabel && "text-muted")}>
          {triggerLabel ?? placeholder}
        </span>
        <span className="flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180">
          <ChevronDownIcon />
        </span>
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <BasePopover.Popup
            className={cn(
              "flex max-h-[min(20rem,var(--available-height))] flex-col rounded-[var(--radius)] border border-border bg-surface text-foreground shadow-xl outline-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            {showSearch && (
              <div className="shrink-0 border-b border-border p-1.5">
                <span className="flex h-8 items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] border border-border bg-surface px-2.5 focus-within:ring-2 focus-within:ring-ring">
                  <span className="flex shrink-0 items-center text-muted">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="w-full min-w-[12rem] bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
                  />
                </span>
              </div>
            )}

            {searching ? (
              // 搜索结果：扁平叶子路径列表，命中即提交全路径。
              <ul role="listbox" aria-label="搜索结果" className="min-w-[16rem] overflow-y-auto p-1">
                {results.length === 0 ? (
                  <li className="px-2 py-6 text-center text-sm text-muted">无匹配项</li>
                ) : (
                  results.map((p) => {
                    const selected = current[current.length - 1] === p.keys[p.keys.length - 1];
                    return (
                      <li key={p.keys.join("/")} role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            commit(p.keys);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-left text-sm outline-none transition-colors",
                            "hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                            selected && "bg-primary/12 text-primary",
                          )}
                        >
                          <span className="truncate">{p.labels.join(" / ")}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : (
              <div className="flex min-h-0 flex-1">
                {cols.map((list, colIndex) => (
                  <ul
                    key={colIndex}
                    role="listbox"
                    aria-label={`第 ${colIndex + 1} 级`}
                    className="min-w-[9rem] overflow-y-auto border-border p-1 [&:not(:last-child)]:border-r"
                  >
                    {list.map((node) => {
                      const active = activePath[colIndex] === node.key;
                      const hasChildren = !!node.children?.length;
                      return (
                        <li key={node.key} role="none">
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            aria-disabled={node.disabled || undefined}
                            disabled={node.disabled}
                            onClick={() => onPick(colIndex, node)}
                            onMouseEnter={() => {
                              if (expandTrigger === "hover" && hasChildren && !node.disabled) {
                                setActivePath([...activePath.slice(0, colIndex), node.key]);
                              }
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-left text-sm outline-none transition-colors",
                              "hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                              active && "bg-primary/12 text-primary",
                              "disabled:pointer-events-none disabled:opacity-50",
                            )}
                          >
                            <span className="truncate">{node.label}</span>
                            {hasChildren ? <ChevronRight className="size-3.5 shrink-0 text-muted" aria-hidden /> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ))}
              </div>
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
