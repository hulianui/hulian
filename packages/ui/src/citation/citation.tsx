import { memo, type HTMLAttributes } from "react";
import { cn } from "../lib/cn";
import type { CitationProps } from "./citation.types";

// 引用来源 chip：序号角标 + 标题(+来源)，有 href 则新标签页外链。纯皮肤·RSC。
// 内联于 agent 回答末尾或正文中标注信息出处。
function CitationImpl({ index, title, href, source, className, ...props }: CitationProps) {
  const inner = (
    <>
      {index != null && (
        <span className="flex size-4 shrink-0 items-center justify-center rounded-[0.25rem] bg-surface-hover text-[10px] font-medium text-muted">
          {index}
        </span>
      )}
      <span className="truncate">{title}</span>
      {source && <span className="shrink-0 text-muted">· {source}</span>}
    </>
  );
  const cls = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 align-middle text-xs text-foreground no-underline transition-colors hover:bg-surface-hover",
    className,
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        {...(props as HTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </a>
    );
  }
  return (
    <span className={cls} {...(props as HTMLAttributes<HTMLSpanElement>)}>
      {inner}
    </span>
  );
}
CitationImpl.displayName = "Citation";

// 引用 chip 成串挂在 agent 回答末尾，回答区一有更新（流式输出、消息追加）父级就重渲染，
// 而引用本身不变。props 全是稳定原语时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Citation = memo(CitationImpl);
Citation.displayName = "Citation";
