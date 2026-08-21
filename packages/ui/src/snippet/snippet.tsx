"use client";
import { memo } from "react";
import { Copy, Check } from "../_icons";
import { cn } from "../lib/cn";
import { useCopiedFlag } from "../lib/use-copied-flag";
import { HighlightedCode } from "../code-block/highlighted-code";
import type { SnippetProps } from "./snippet.types";
import { useComponentLocale } from "../config/locale-context";

// 可复制命令/代码片段（含剪贴板交互故 "use client"）。复制成功反馈 1.5s 切回。
// children 为字符串时默认语法着色（命令多为纯色，JS 片段会着色）；非字符串原样渲染。
function SnippetImpl({
  children,
  text,
  symbol = "$",
  lang,
  highlight = true,
  copyLabel,
  copiedLabel,
  className,
}: SnippetProps) {
  const locale = useComponentLocale().snippet ?? { copy: "复制", copied: "已复制" };
  const resolvedCopyLabel = copyLabel ?? locale.copy;
  const resolvedCopiedLabel = copiedLabel ?? locale.copied;
  const [copied, markCopied] = useCopiedFlag();
  const copyText = text ?? (typeof children === "string" ? children : "");
  const colorable = highlight && typeof children === "string";
  // 带 `$`/`>` 等提示符的片段默认按 shell 着色（命令名+flag 上色）；symbol={null} 视作代码片段走默认(JS)。
  const effLang = lang ?? (symbol != null ? "bash" : undefined);

  const onCopy = () => {
    void navigator.clipboard?.writeText(copyText);
    markCopied();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 font-mono text-sm",
        className,
      )}
    >
      {symbol != null && <span className="select-none text-muted-foreground">{symbol}</span>}
      <code className="text-foreground">
        {colorable ? <HighlightedCode code={children as string} lang={effLang} /> : children}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? resolvedCopiedLabel : resolvedCopyLabel}
        className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
SnippetImpl.displayName = "Snippet";

// 命令片段常成排出现在文档/安装引导里，且 children 多为字符串字面量（引用稳定）；
// 不 memo 则父级一动就整排重跑 HighlightedCode 的着色。
// props 全稳定时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Snippet = memo(SnippetImpl);
Snippet.displayName = "Snippet";
