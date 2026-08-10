"use client";
import { cn } from "../lib/cn";
import { Button } from "../button";

import { useComponentLocale } from "../config/locale-context";
import type { ConfirmCardProps } from "./confirm-card.types";

export function ConfirmCard({
  title,
  items,
  confirmText,
  editText,
  onConfirm,
  onEdit,
  acted = null,
  className,
}: ConfirmCardProps) {
  const locale = useComponentLocale().confirmCard ?? {
    title: "请确认以下信息",
    confirm: "确认无误",
    edit: "需要修改",
    confirmed: "已确认",
    editing: "修改中",
  };
  const resolvedTitle = title === undefined ? locale.title : title;
  const resolvedConfirmText = confirmText === undefined ? locale.confirm : confirmText;
  const resolvedEditText = editText === undefined ? locale.edit : editText;
  return (
    <div className={cn("rounded-[var(--radius)] border border-border bg-surface p-3", className)}>
      {resolvedTitle && <p className="mb-2.5 text-xs font-medium text-muted-foreground">{resolvedTitle}</p>}
      <dl className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <dt className="w-16 shrink-0 text-muted-foreground">{it.label}</dt>
            <dd className="min-w-0 flex-1 text-foreground">{it.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" disabled={acted !== null} onClick={onConfirm}>
          {acted === "confirmed" ? locale.confirmed : resolvedConfirmText}
        </Button>
        {/* 单动作场景（如仅「去充值」）：不传 onEdit 即不渲染修改钮，避免出现无响应的死按钮 */}
        {onEdit && (
          <Button size="sm" variant="ghost" disabled={acted !== null} onClick={onEdit}>
            {acted === "edited" ? locale.editing : resolvedEditText}
          </Button>
        )}
      </div>
    </div>
  );
}
