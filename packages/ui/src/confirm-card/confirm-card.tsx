"use client";
import { cn } from "../lib/cn";
import { Button } from "../button";
import type { ConfirmCardProps } from "./confirm-card.types";

export function ConfirmCard({
  title = "请确认以下信息",
  items,
  confirmText = "确认无误",
  editText = "需要修改",
  onConfirm,
  onEdit,
  acted = null,
  className,
}: ConfirmCardProps) {
  return (
    <div className={cn("rounded-[var(--radius)] border border-border bg-surface p-3", className)}>
      {title && <p className="mb-2.5 text-xs font-medium text-muted">{title}</p>}
      <dl className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <dt className="w-16 shrink-0 text-muted">{it.label}</dt>
            <dd className="min-w-0 flex-1 text-foreground">{it.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" disabled={acted !== null} onClick={onConfirm}>
          {acted === "confirmed" ? "已确认" : confirmText}
        </Button>
        <Button size="sm" variant="ghost" disabled={acted !== null} onClick={onEdit}>
          {acted === "edited" ? "修改中" : editText}
        </Button>
      </div>
    </div>
  );
}
