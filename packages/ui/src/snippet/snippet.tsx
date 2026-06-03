"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../lib/cn";
import type { SnippetProps } from "./snippet.types";

// 可复制命令/代码片段（含剪贴板交互故 "use client"）。复制成功反馈 1.5s 切回。
export function Snippet({ children, text, symbol = "$", className }: SnippetProps) {
  const [copied, setCopied] = useState(false);
  const copyText = text ?? (typeof children === "string" ? children : "");

  const onCopy = () => {
    void navigator.clipboard?.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 font-mono text-sm",
        className,
      )}
    >
      {symbol != null && <span className="select-none text-muted">{symbol}</span>}
      <code className="text-foreground">{children}</code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "已复制" : "复制"}
        className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
