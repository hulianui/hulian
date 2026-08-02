"use client";
import { useState } from "react";
import { Copy, Check } from "../_icons";
import { cn } from "../lib/cn";
import { HighlightedCode } from "./highlighted-code";
import type { CodeBlockProps } from "./code-block.types";
import { useComponentLocale } from "../config/locale";

// 多行代码块（区别于行内 Code、单行命令 Snippet）：<pre> 容器 + 右上角复制按钮 + 可选语言标签。
// 含剪贴板交互故 "use client"；复制成功反馈 1.5s 切回。皮肤走语义 token。
// 语法着色由零依赖 tokenizeCode 产出 token 列表，逐段套 <span>（见 code-highlight.ts）。
export function CodeBlock({ code, lang, copyable = true, highlight = true, className }: CodeBlockProps) {
  const labels = useComponentLocale().codeBlock;
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
          aria-label={copied ? labels.copied : labels.copy}
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 text-xs text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          {copied ? labels.copied : labels.copy}
        </button>
      )}
      <pre
        tabIndex={0}
        aria-label={labels.region(lang)}
        className={cn("overflow-auto p-4 text-sm leading-relaxed", lang != null && "pt-8")}
      >
        <code className="font-mono text-foreground">
          {highlight ? <HighlightedCode code={code} lang={lang} /> : code}
        </code>
      </pre>
    </div>
  );
}
