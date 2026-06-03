"use client";
import { useState } from "react";
import { Copy, Check } from "../_icons";
import { cn } from "../lib/cn";
import type { CodeBlockProps } from "./code-block.types";

// 多行代码块（区别于行内 Code、单行命令 Snippet）：<pre> 容器 + 右上角复制按钮 + 可选语言标签。
// 含剪贴板交互故 "use client"；复制成功反馈 1.5s 切回。皮肤走语义 token。
export function CodeBlock({ code, lang, copyable = true, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
        className,
      )}
    >
      {lang != null && (
        <span className="pointer-events-none absolute left-3 top-2 select-none font-mono text-xs text-muted">
          {lang}
        </span>
      )}
      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "已复制" : "复制"}
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 text-xs text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          {copied ? "已复制" : "复制"}
        </button>
      )}
      <pre className={cn("overflow-auto p-4 text-sm leading-relaxed", lang != null && "pt-8")}>
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}
