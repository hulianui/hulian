"use client";
import { memo, useEffect, useId, useRef, useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, TextWrap } from "../_icons";
import { cn } from "../lib/cn";
import { useCopiedFlag } from "../lib/use-copied-flag";
import { classicScrollbar } from "../lib/scrollbar";
import { HighlightedCode, NumberedCode } from "./highlighted-code";
import type { CodeBlockProps } from "./code-block.types";
import { useComponentLocale } from "../config/locale-context";

// 多行代码块（区别于行内 Code、单行命令 Snippet）。结构：
//   有 lang → 标题栏（语言名 + 操作区）+ 代码区；
//   无 lang → 只有代码区，操作区悬浮在右上角，悬停 / 键盘聚焦时才出现（触屏常显）。
// 含剪贴板 / 换行 / 折叠交互故 "use client"。皮肤走语义 token。
// 语法着色由零依赖 tokenizeCode 产出 token 列表，逐段套 <span>（见 code-highlight.ts）。

// 超出 maxLines 不足这么多行时直接全部展示：为藏掉一两行加一个「展开」按钮，
// 按钮本身就比被藏的内容高，纯属给读者添一次点击。
const COLLAPSE_SLACK = 3;

const actionClass =
  "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-[min(var(--radius),0.375rem)] text-xs text-muted-foreground outline-none transition-colors hover:bg-primary-subtle hover:text-primary focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-primary-subtle aria-pressed:text-primary";

function CodeBlockImpl({
  code,
  lang,
  copyable = true,
  highlight = true,
  lineNumbers = false,
  defaultWrap = false,
  maxLines,
  className,
}: CodeBlockProps) {
  const numbered = Boolean(lineNumbers);
  const startLine = typeof lineNumbers === "object" && lineNumbers ? lineNumbers.start ?? 1 : 1;
  const locale = useComponentLocale().codeBlock;
  const labels = {
    copy: locale?.copy ?? "复制",
    copied: locale?.copied ?? "已复制",
    region: locale?.region ?? ((language?: string) => (language ? `${language} 代码` : "代码")),
    wrap: locale?.wrap ?? "自动换行",
    expand: locale?.expand ?? ((lines: number) => `展开全部 ${lines} 行`),
    collapse: locale?.collapse ?? "收起",
  };
  const [copied, markCopied] = useCopiedFlag();
  const [wrapped, setWrapped] = useState(defaultWrap);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const preId = useId();

  const lineCount = code.split("\n").length;
  const collapsible = maxLines != null && maxLines > 0 && lineCount >= maxLines + COLLAPSE_SLACK;
  const collapsed = collapsible && !expanded;

  // 换行开关只在「真有一行放不下」时出现：短代码块上多一个永远点了没效果的按钮只是噪音。
  // 量的是 <pre> 的 scrollWidth —— 字体、容器宽度、侧栏开合都会改变它，所以挂 ResizeObserver。
  // 已换行时 scrollWidth 必然不再溢出，此时开关靠 wrapped 留住，否则用户关不回去。
  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const measure = () => setOverflowing(pre.scrollWidth > pre.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(pre);
    return () => ro.disconnect();
  }, [code, numbered]);

  const onCopy = () => {
    void navigator.clipboard?.writeText(code);
    markCopied();
  };

  const onToggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    // 收起长代码时读者通常停在块的底部：内容一缩，视口里就只剩下文了，
    // 读者得往回找刚才在看的块。把块顶拉回视口，收起后眼睛仍落在它身上。
    if (!next) {
      const root = rootRef.current;
      if (root && root.getBoundingClientRect().top < 0) {
        root.scrollIntoView?.({ block: "start", behavior: "smooth" });
      }
    }
  };

  const hasHeader = lang != null;
  const showWrap = overflowing || wrapped;
  const hasActions = copyable || showWrap;

  const actions = hasActions ? (
    <div
      data-slot="code-block-actions"
      className={cn(
        "flex items-center gap-0.5",
        !hasHeader &&
          "absolute right-1.5 top-1.5 z-10 rounded-[min(var(--radius),0.5rem)] border border-border bg-surface p-0.5 opacity-0 transition-opacity group-hover/code-block:opacity-100 group-focus-within/code-block:opacity-100 [@media(hover:none)]:opacity-100",
        !hasHeader && copied && "opacity-100",
      )}
    >
      {showWrap && (
        <button
          type="button"
          onClick={() => setWrapped((w) => !w)}
          aria-pressed={wrapped}
          aria-label={labels.wrap}
          title={labels.wrap}
          className={cn(actionClass, "w-7")}
        >
          <TextWrap className="size-3.5" />
        </button>
      )}
      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? labels.copied : labels.copy}
          title={hasHeader ? undefined : copied ? labels.copied : labels.copy}
          className={cn(actionClass, hasHeader ? "px-2" : "w-7")}
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          {hasHeader && <span>{copied ? labels.copied : labels.copy}</span>}
        </button>
      )}
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      data-slot="code-block"
      className={cn(
        // --hl-cb-bg：代码区底色。比 surface 沉半档，放在卡片(surface)里读作「嵌进去的一块」，
        // 放在页面底上靠边框成形。行号列的 sticky 遮挡与折叠渐隐都吃同一个变量，三处永远同色。
        // --hl-cb-head-bg：标题栏底色。有 lang 时标题栏是「外壳」，不是代码本身 —— 与代码区同色时
        // 整块只剩一片灰，读者分不清哪一条是 chrome、哪一条是内容。它要比代码区（surface 与 muted 的
        // 中间档）再拉开一档：亮色里 --color-muted 离 surface 只有十来阶，单用它压成 36px 的一条
        // 仍然糊成一片，所以再往 --color-border 掺 40%；暗色下 subtle 与 border 同值，此处自然退化回
        // subtle —— 暗色本来就够反差（subtle 比代码区亮）。方向两态相反，但「不同色」两态都成立。
        // 两个变量分开而不是让标题栏直接写 bg-subtle：消费方在深色 hero 等局部换底时只需覆盖一个，
        // 不至于让盖了代码区的块在顶上留一条主题色的带。
        "group/code-block relative overflow-hidden rounded-[var(--radius)] border border-border bg-(--hl-cb-bg) [--hl-cb-bg:color-mix(in_oklab,var(--color-muted)_45%,var(--color-surface))] [--hl-cb-head-bg:color-mix(in_oklab,var(--color-subtle)_60%,var(--color-border))]",
        className,
      )}
    >
      {hasHeader && (
        <div
          data-slot="code-block-header"
          className="flex h-9 items-center justify-between gap-2 border-b border-border bg-(--hl-cb-head-bg) pl-4 pr-1"
        >
          <span className="min-w-0 select-none truncate font-mono text-xs text-muted-foreground">
            {lang}
          </span>
          {actions}
        </div>
      )}
      {!hasHeader && actions}
      <div className="relative">
        <pre
          ref={preRef}
          id={preId}
          tabIndex={0}
          aria-label={labels.region(lang)}
          className={cn(
            "overflow-auto px-4 py-3.5 text-sm leading-relaxed outline-none [tab-size:2] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            // 常驻细滚动条：macOS 默认 overlay 条平时不可见，长行被截在右边却看不出「还能滚」。
            // 皮肤只许从 lib/scrollbar 取（裸写 scrollbar-width 会让 Chromium 一条都不画，#347）。
            classicScrollbar.border,
            "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2",
            numbered && "pl-0",
            wrapped && "whitespace-pre-wrap [overflow-wrap:anywhere]",
            collapsed && "overflow-y-hidden",
          )}
          // 1.625em = leading-relaxed 的行高（em 相对 <pre> 自己的 text-sm）；1.75rem = 上下 py-3.5。
          style={collapsed ? { maxHeight: `calc(${maxLines} * 1.625em + 1.75rem)` } : undefined}
        >
          <code className={cn("font-mono text-foreground", numbered && "block")}>
            {numbered ? (
              <NumberedCode
                code={code}
                lang={lang}
                highlight={highlight}
                start={startLine}
                wrap={wrapped}
              />
            ) : highlight ? (
              <HighlightedCode code={code} lang={lang} />
            ) : (
              code
            )}
          </code>
        </pre>
        {collapsed && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-(--hl-cb-bg) to-transparent"
          />
        )}
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-controls={preId}
          data-slot="code-block-toggle"
          className="flex h-8 w-full items-center justify-center gap-1 border-t border-border text-xs text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {expanded ? labels.collapse : labels.expand(lineCount)}
        </button>
      )}
    </div>
  );
}
CodeBlockImpl.displayName = "CodeBlock";

// 文档/日志页一屏就有十几个代码块，每个都要重新分词 + 逐 token 建 <span>，
// 父级一动全体重算。props 全是原语时 React 无法自己 bailout，只能靠 memo。
export const CodeBlock = memo(CodeBlockImpl);
CodeBlock.displayName = "CodeBlock";
