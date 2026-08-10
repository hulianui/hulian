"use client";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { PromptSuggestionsProps, Suggestion } from "./prompt-suggestions.types";

// 建议提示：可点击 pill 列表，点击回传 value 以填充 PromptInput / 直接发起对话。
function normalize(s: Suggestion): { label: ReactNode; value: string } {
  if (typeof s === "string") return { label: s, value: s };
  return { label: s.label, value: s.value ?? (typeof s.label === "string" ? s.label : "") };
}

export function PromptSuggestions({
  suggestions,
  onSelect,
  title,
  className,
  ...props
}: PromptSuggestionsProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {title && <p className="text-xs font-medium text-muted-foreground">{title}</p>}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => {
          const { label, value } = normalize(s);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(value)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
