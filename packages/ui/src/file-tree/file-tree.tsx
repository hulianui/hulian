"use client";
import { useState } from "react";
import { ChevronRight, Folder, File } from "../_icons";
import { cn } from "../lib/cn";
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

interface RowProps {
  node: FileNode;
  depth: number;
  path: string;
  selectedPath?: string;
  onSelect?: FileTreeProps["onSelect"];
}

function Row({ node, depth, path, selectedPath, onSelect }: RowProps) {
  const [open, setOpen] = useState(node.defaultExpanded ?? false);
  const isFolder = node.type === "folder";
  const selected = selectedPath === path;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (isFolder) setOpen((o) => !o);
          onSelect?.(node, path);
        }}
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
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({ nodes, selectedPath, onSelect, className }: FileTreeProps) {
  return (
    <ul
      className={cn(
        "rounded-[var(--radius)] border border-border bg-surface p-1.5",
        className,
      )}
    >
      {nodes.map((node, i) => (
        <Row
          key={i}
          node={node}
          depth={0}
          path={node.name}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
