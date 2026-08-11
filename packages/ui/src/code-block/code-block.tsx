"use client";
import { memo, useState } from "react";
import { Copy, Check } from "../_icons";
import { cn } from "../lib/cn";
import { HighlightedCode, NumberedCode } from "./highlighted-code";
import type { CodeBlockProps } from "./code-block.types";
import { useComponentLocale } from "../config/locale-context";

// 多行代码块（区别于行内 Code、单行命令 Snippet）：<pre> 容器 + 右上角复制按钮 + 可选语言标签。
// 含剪贴板交互故 "use client"；复制成功反馈 1.5s 切回。皮肤走语义 token。
// 语法着色由零依赖 tokenizeCode 产出 token 列表，逐段套 <span>（见 code-highlight.ts）。
// lineNumbers 开启后走逐行渲染（见 highlighted-code.tsx 的 NumberedCode），默认关闭时 DOM 不变。
function CodeBlockImpl({
  code,
  lang,
  copyable = true,
  highlight = true,
  lineNumbers = false,
  className,
}: CodeBlockProps) {
  // 行号列自带左内边距（sticky 时要一路遮到容器最左边），所以开行号后 <pre> 交出 pl。
  const numbered = Boolean(lineNumbers);
  const startLine = typeof lineNumbers === "object" && lineNumbers ? lineNumbers.start ?? 1 : 1;
  const labels = useComponentLocale().codeBlock ?? {
    copy: "复制",
    copied: "已复制",
    region: (language) => (language ? `${language} 代码` : "代码"),
  };
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
        <span className="pointer-events-none absolute left-3 top-2 select-none font-mono text-xs text-muted-foreground">
          {lang}
        </span>
      )}
      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? labels.copied : labels.copy}
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          {copied ? labels.copied : labels.copy}
        </button>
      )}
      <pre
        tabIndex={0}
        aria-label={labels.region(lang)}
        className={cn(
          "overflow-auto p-4 text-sm leading-relaxed",
          numbered && "pl-0",
          lang != null && "pt-8",
        )}
      >
        <code className={cn("font-mono text-foreground", numbered && "block")}>
          {numbered ? (
            <NumberedCode code={code} lang={lang} highlight={highlight} start={startLine} />
          ) : highlight ? (
            <HighlightedCode code={code} lang={lang} />
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}
CodeBlockImpl.displayName = "CodeBlock";

// 文档/日志页一屏就有十几个代码块，每个都要重新分词 + 逐 token 建 <span>，
// 父级一动全体重算。props 全是原语时 React 无法自己 bailout，只能靠 memo。
export const CodeBlock = memo(CodeBlockImpl);
CodeBlock.displayName = "CodeBlock";
