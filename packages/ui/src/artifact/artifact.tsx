"use client";
import { useState } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { Chip } from "../chip";
import type { ArtifactProps } from "./artifact.types";

export function Artifact({
  title,
  icon,
  version,
  actions,
  collapsedHeight = 240,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  expandLabel,
  collapseLabel,
  className,
  children,
}: ArtifactProps) {
  const copy = useComponentLocale().artifact ?? { expand: "展开全文", collapse: "收起" };
  const [inner, setInner] = useState(defaultExpanded);
  const collapsible = collapsedHeight > 0;
  const expanded = expandedProp ?? inner;
  const setExpanded = (next: boolean) => {
    if (expandedProp === undefined) setInner(next);
    onExpandedChange?.(next);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {icon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</span>
        {version != null && (
          <Chip size="sm" variant="soft" tone="neutral">
            {version}
          </Chip>
        )}
        {actions && <span className="flex shrink-0 items-center gap-1">{actions}</span>}
      </div>
      <div className="relative">
        <div
          data-artifact-body
          className="overflow-hidden p-4"
          style={collapsible && !expanded ? { maxHeight: collapsedHeight } : undefined}
        >
          {children}
        </div>
        {collapsible && !expanded && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent"
          />
        )}
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="block w-full border-t border-border py-1.5 text-center text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          {expanded ? collapseLabel ?? copy.collapse : expandLabel ?? copy.expand}
        </button>
      )}
    </div>
  );
}
