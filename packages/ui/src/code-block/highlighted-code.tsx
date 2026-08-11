import { memo, type CSSProperties, type ReactNode } from "react";
import { cn } from "../lib/cn";
import {
  splitTokensByLine,
  tokenizeCode,
  type CodeToken,
  type CodeTokenType,
} from "./code-highlight";

// 各 token 类型的着色（吃 --code-* 语义 token → 明暗主题自动跟随）。plain 不着色。
const TOKEN_STYLE: Partial<Record<CodeTokenType, CSSProperties>> = {
  comment: { color: "var(--code-comment)", fontStyle: "italic" },
  string: { color: "var(--code-string)" },
  keyword: { color: "var(--code-keyword)" },
  number: { color: "var(--code-number)" },
  tag: { color: "var(--code-tag)" },
  attr: { color: "var(--code-attr)" },
  // Shell：命令名复用 keyword（brand）色突出，flag/选项复用 attr（紫）色与命令区分。
  command: { color: "var(--code-keyword)", fontWeight: 500 },
  flag: { color: "var(--code-attr)" },
};

// 纯文本段直接返回字符串，避免无谓节点。
function renderTokens(tokens: CodeToken[]): ReactNode[] {
  return tokens.map((t, i) =>
    t.type === "plain" ? (
      t.value
    ) : (
      <span key={i} style={TOKEN_STYLE[t.type]}>
        {t.value}
      </span>
    ),
  );
}

// 把代码文本切分着色，逐段套 <span>。
// 无 hook / 无状态 → 既能被 client 组件用，也不阻碍 SSR。
function HighlightedCodeImpl({ code, lang }: { code: string; lang?: string }) {
  return <>{renderTokens(tokenizeCode(code, lang))}</>;
}
HighlightedCodeImpl.displayName = "HighlightedCode";

// memo 是给 CodeBlock 自身状态变化兜底的：复制按钮每点一次就切两回 copied，
// 而 code/lang 一个字没变，没 memo 就要整段重新分词 + 重建全部 <span>。
// 外层 CodeBlock 的 memo 只挡得住父级更新，挡不住这条路径。
export const HighlightedCode = memo(HighlightedCodeImpl);
HighlightedCode.displayName = "HighlightedCode";

/**
 * 带行号的渲染（CodeBlock lineNumbers 用，不对外导出）。三条硬约束都在这里落实：
 *
 * 1. 行号不能进复制内容 —— 行号槽 aria-hidden + select-none：屏幕阅读器不念，
 *    用户框选整段代码时浏览器也不会把 "1 2 3" 混进剪贴板（复制按钮走的是原始 code prop）。
 * 2. 行号不能被横向滚动带走 —— 行号槽 sticky left-0 + 不透明 bg-surface 遮住滑到底下的代码。
 *    选 sticky 而不是「<pre> 外面单开一列」：<pre> 自己就是滚动容器，消费方一旦用 className
 *    限高，纵向滚动发生在 <pre> 内部，外置的列跟不动就会整列错位。
 * 3. 行号列宽按最大行号的位数算（--hl-cb-gutter，单位 ch），不写死，4 位数不会顶到代码上。
 *
 * 每行一个 flex 行盒：w-max min-w-full 让行盒铺满「内容宽 / 容器宽」里的较大者，
 * 否则横滚之后 sticky 的可停靠范围会在容器右边缘断掉。空行由行号撑出行盒，不会塌成 0 高。
 */
function NumberedCodeImpl({
  code,
  lang,
  highlight,
  start,
}: {
  code: string;
  lang?: string;
  highlight: boolean;
  start: number;
}) {
  const lines = highlight
    ? splitTokensByLine(tokenizeCode(code, lang))
    : code.split("\n").map((value) => (value ? [{ type: "plain" as const, value }] : []));
  const digits = String(Math.max(1, start + lines.length - 1)).length;

  return (
    <span
      className="block"
      style={{ "--hl-cb-gutter": `${digits}ch` } as CSSProperties}
      data-slot="code-block-lines"
    >
      {lines.map((tokens, i) => (
        <span key={i} className="flex w-max min-w-full">
          <span
            aria-hidden
            data-slot="code-block-line-number"
            className={cn(
              "sticky left-0 shrink-0 select-none border-r border-border bg-surface",
              "w-[calc(var(--hl-cb-gutter)+1.75rem)] pl-4 pr-3 text-right tabular-nums text-muted-foreground",
            )}
          >
            {start + i}
          </span>
          <span className="pl-3">{renderTokens(tokens)}</span>
        </span>
      ))}
    </span>
  );
}
NumberedCodeImpl.displayName = "NumberedCode";

export const NumberedCode = memo(NumberedCodeImpl);
NumberedCode.displayName = "NumberedCode";
