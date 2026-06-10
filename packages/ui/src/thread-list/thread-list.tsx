"use client";
import { X } from "../_icons";
import { cn } from "../lib/cn";
import type { ThreadListProps } from "./thread-list.types";

export function ThreadList({
  items,
  onSelect,
  onDelete,
  title = "历史",
  action,
  empty = "暂无历史",
  bare = false,
  className,
}: ThreadListProps) {
  return (
    <div
      className={cn(
        !bare && "rounded-[var(--radius)] border border-border bg-surface p-3",
        className,
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        {title && <p className="text-xs font-medium text-muted">{title}</p>}
        {action}
      </div>
      {items.length === 0 ? (
        <p className="px-2 py-3 text-center text-xs text-muted">{empty}</p>
      ) : (
        <ol className="space-y-0.5">
          {items.map((it) => (
            <li key={it.id} data-active={it.active || undefined} className="group relative">
              <button
                type="button"
                onClick={() => onSelect?.(it.id)}
                className={cn(
                  "w-full rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-hover",
                  onDelete && "pr-11",
                  it.active && "bg-surface-hover",
                )}
              >
                <span
                  className={cn(
                    "block truncate text-sm",
                    it.active ? "font-medium text-foreground" : "text-foreground",
                  )}
                >
                  {it.title}
                </span>
                {it.meta != null && (
                  <span className="mt-0.5 block truncate text-xs text-muted">{it.meta}</span>
                )}
              </button>
              {onDelete && (
                <button
                  type="button"
                  aria-label="删除会话"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(it.id);
                  }}
                  // 视觉保持 size-6，伪元素外扩 10px → 44px 触控命中区（移动端拇指友好）
                  className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted/60 transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:bg-surface-hover hover:text-danger"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
