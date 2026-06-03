"use client";
import { useState } from "react";

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard 不可用时静默失败
    }
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "已复制" : "复制代码"}
        className="absolute right-2 top-2 z-10 rounded border border-border bg-surface px-2 py-1 text-xs text-muted opacity-0 transition-[opacity,color] hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? "已复制" : "复制"}
      </button>
      <pre className={`overflow-auto bg-surface p-4 text-sm leading-relaxed ${className ?? ""}`}>
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  );
}
