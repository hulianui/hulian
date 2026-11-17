"use client";
import { createContext, memo, useContext, type ReactNode } from "react";
import { Copy, Check } from "../_icons";
import { cn } from "../lib/cn";
import { useCopiedFlag } from "../lib/use-copied-flag";
import { HighlightedCode } from "../code-block/highlighted-code";
import type { SnippetGroupProps, SnippetProps } from "./snippet.types";
import { useComponentLocale } from "../config/locale-context";

// SnippetGroup 里的 Snippet 去掉自己的边框 / 底色 / 圆角，铺满一行 —— 外框与行间分隔由组来画。
const SnippetGroupContext = createContext(false);

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
  muted = false,
  className,
}: SnippetProps) {
  const grouped = useContext(SnippetGroupContext);
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
        // max-w-full + code 的 min-w-0 / overflow-wrap:anywhere：一整串不带空格的内容（URL、长 token）
        // 在窄容器里折行，而不是把 Snippet 连同父级一起撑出视口。anywhere 只在装不下时才断，
        // 带空格的命令仍然按词换行。
        "inline-flex max-w-full items-center gap-3 font-mono text-sm",
        grouped
          ? "flex w-full px-4 py-3"
          : "rounded-[var(--hl-radius-control,var(--radius))] border border-border px-3 py-2",
        // muted：次要行（「也可以这样」的补充命令、给 AI 读的链接）—— 沉一档底色、文字转次要灰。
        muted ? "bg-muted/50 text-muted-foreground" : grouped ? "" : "bg-surface",
        className,
      )}
    >
      {symbol != null && (
        <span className="shrink-0 select-none text-muted-foreground">{symbol}</span>
      )}
      <code
        className={cn(
          "min-w-0 [overflow-wrap:anywhere]",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {colorable ? <HighlightedCode code={children as string} lang={effLang} /> : children}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? resolvedCopiedLabel : resolvedCopyLabel}
        // hover 走品牌色高亮：Snippet 自身是 surface 底，surface-hover 只沉一档，在白底上几乎看不出「这是个能点的东西」。
        className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-muted-foreground outline-none transition-colors hover:bg-primary-subtle hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
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

/**
 * 多条可复制命令堆叠在同一张卡里：安装 → 初始化 → 文档地址这类「一组上手步骤」。
 * 组画外框与行间分隔线，里面的 Snippet 自动去掉各自的边框 / 底色 / 圆角并铺满一行。
 * `overlay` 放 BorderBeam 这类绝对定位的装饰层 —— 它画在分隔线列表之外，不会被当成一行。
 */
export function SnippetGroup({ overlay, className, children, ...props }: SnippetGroupProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-surface shadow-sm",
        className,
      )}
      {...props}
    >
      {overlay}
      <div className="divide-y divide-border/70">
        <SnippetGroupContext.Provider value={true}>
          {children as ReactNode}
        </SnippetGroupContext.Provider>
      </div>
    </div>
  );
}
