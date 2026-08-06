"use client";
import { memo, useMemo, useState, type MouseEvent } from "react";
import { ChevronRight, Folder, File } from "../_icons";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { filterFileTree } from "./file-tree-core";
import type { FileNode, FileStatus, FileTreeProps } from "./file-tree.types";

// 状态 → 字母 + 字面色类（git status 习惯）。
const STATUS_META: Record<FileStatus, { letter: string; toneClass: string }> = {
  added: { letter: "A", toneClass: "text-success" },
  modified: { letter: "M", toneClass: "text-warning" },
  deleted: { letter: "D", toneClass: "text-danger" },
  untracked: { letter: "U", toneClass: "text-muted" },
  renamed: { letter: "R", toneClass: "text-primary" },
};

export function fileStatusMeta(status: FileStatus) {
  return STATUS_META[status];
}

function StatusBadge({ status }: { status?: FileStatus }) {
  if (!status) return null;
  const m = STATUS_META[status];
  return (
    <span className={cn("ml-auto shrink-0 pl-2 font-mono text-xs font-medium", m.toneClass)}>
      {m.letter}
    </span>
  );
}

// 收集所有 defaultExpanded folder 的 path（向后兼容初值）。
function collectDefaultExpanded(nodes: FileNode[], parent: string, acc: Set<string>) {
  for (const n of nodes) {
    const path = parent ? `${parent}/${n.name}` : n.name;
    if (n.type === "folder") {
      if (n.defaultExpanded) acc.add(path);
      if (n.children) collectDefaultExpanded(n.children, path, acc);
    }
  }
}

interface RowProps {
  node: FileNode;
  depth: number;
  path: string;
  selectedPath?: string;
  expandedSet: Set<string>;
  toggle: (path: string) => void;
  onSelect?: FileTreeProps["onSelect"];
  onContextMenu?: FileTreeProps["onContextMenu"];
  /** 搜索激活时的可见 path 白名单（null = 不过滤）。 */
  visible: Set<string> | null;
}

function Row({
  node,
  depth,
  path,
  selectedPath,
  expandedSet,
  toggle,
  onSelect,
  onContextMenu,
  visible,
}: RowProps) {
  if (visible && !visible.has(path)) return null;
  const isFolder = node.type === "folder";
  const open = isFolder && expandedSet.has(path);
  const selected = selectedPath === path;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (isFolder) toggle(path);
          onSelect?.(node, path);
        }}
        onContextMenu={(e: MouseEvent) => onContextMenu?.(node, path, e)}
        aria-expanded={isFolder ? open : undefined}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-sm text-foreground hover:bg-surface-hover",
          selected && "bg-surface-hover",
        )}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-muted">
          {isFolder ? (
            <ChevronRight
              className={cn("size-3.5 transition-transform", open && "rotate-90")}
              aria-hidden
            />
          ) : null}
        </span>
        <span className="shrink-0 text-muted [&>svg]:size-4">
          {isFolder ? <Folder aria-hidden /> : <File aria-hidden />}
        </span>
        <span className="truncate">{node.name}</span>
        <StatusBadge status={node.status} />
      </button>
      {isFolder && open && node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child, i) => (
            <Row
              key={i}
              node={child}
              depth={depth + 1}
              path={`${path}/${child.name}`}
              selectedPath={selectedPath}
              expandedSet={expandedSet}
              toggle={toggle}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              visible={visible}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function FileTreeImpl({
  nodes,
  selectedPath,
  onSelect,
  onContextMenu,
  className,
  expandedPaths,
  defaultExpandedPaths,
  onExpandedChange,
  searchable,
  searchPlaceholder,
}: FileTreeProps) {
  const copy = useComponentLocale().fileTree ?? { search: "搜索文件" };
  const resolvedSearchPlaceholder = searchPlaceholder ?? copy.search;
  const [query, setQuery] = useState("");

  // 向后兼容初值：各 folder defaultExpanded 收集的 path ∪ defaultExpandedPaths。
  const defaultExpanded = useMemo(() => {
    const s = new Set<string>(defaultExpandedPaths ?? []);
    collectDefaultExpanded(nodes, "", s);
    return s;
  }, [nodes, defaultExpandedPaths]);

  const [uncontrolled, setUncontrolled] = useState<Set<string>>(defaultExpanded);
  const controlled = expandedPaths != null;
  const userExpanded = controlled ? new Set(expandedPaths) : uncontrolled;

  const search = useMemo(
    () => (searchable ? filterFileTree(nodes, query) : null),
    [searchable, nodes, query],
  );

  // 搜索激活：可见集 = 命中 path + 其所有祖先；展开集 = 用户展开 ∪ 自动展开。
  const { visible, expandedSet } = useMemo<{
    visible: Set<string> | null;
    expandedSet: Set<string>;
  }>(() => {
    if (!search || query.trim() === "") return { visible: null, expandedSet: userExpanded };
    const vis = new Set<string>();
    for (const p of search.matchedPaths) {
      const parts = p.split("/");
      let acc = "";
      for (const part of parts) {
        acc = acc ? `${acc}/${part}` : part;
        vis.add(acc);
      }
    }
    for (const p of search.autoExpandPaths) vis.add(p);
    return { visible: vis, expandedSet: new Set([...userExpanded, ...search.autoExpandPaths]) };
  }, [search, query, userExpanded]);

  const toggle = (path: string) => {
    const next = new Set(userExpanded);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    if (!controlled) setUncontrolled(next);
    onExpandedChange?.([...next]);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {searchable && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={resolvedSearchPlaceholder}
          aria-label={resolvedSearchPlaceholder}
          className="w-full rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1.5 text-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
      )}
      <ul className="rounded-[var(--radius)] border border-border bg-surface p-1.5">
        {nodes.map((node, i) => (
          <Row
            key={i}
            node={node}
            depth={0}
            path={node.name}
            selectedPath={selectedPath}
            expandedSet={expandedSet}
            toggle={toggle}
            onSelect={onSelect}
            onContextMenu={onContextMenu}
            visible={visible}
          />
        ))}
      </ul>
    </div>
  );
}
FileTreeImpl.displayName = "FileTree";

// 树是递归渲染的：根组件重算一次，整棵 Row 子树跟着全部重建。侧栏文件树的父级
// （编辑器壳、面板布局）更新频繁而 nodes 引用通常不变，memo 在根上一挡就是整棵树。
// 注意别改成 memo(Row)：Row 收的 toggle / expandedSet 每轮都是新引用，浅比较必然失败。
export const FileTree = memo(FileTreeImpl);
FileTree.displayName = "FileTree";
