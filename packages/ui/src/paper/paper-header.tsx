"use client";
import { useId } from "react";
import { cn } from "../lib/cn";
import { usePaperLabels } from "./paper-labels";
import type { PaperHeaderProps } from "./paper.types";

// 论文标题区：题目夹在上粗下细两条线之间（会议论文的常见版式），下面是作者、一行说明、摘要。
// 和 Paper 不同，这块自带排版：它就是一个固定体裁，消费方不必每篇重写一遍。
// 摘要标题跟随 Paper 的论文语言（labels.abstract），不跟界面语言。

export function PaperHeader({
  title,
  titleAs: Title = "h1",
  authors,
  meta,
  abstract,
  className,
  ref,
  ...rest
}: PaperHeaderProps) {
  const labels = usePaperLabels();
  const abstractId = useId();
  const hasAbstract = abstract !== undefined && abstract !== null && abstract !== false;

  return (
    <header {...rest} ref={ref} data-paper-header="" className={cn("mb-8 text-center", className)}>
      <Title className="m-0 border-b border-t-4 border-foreground px-2 py-4 text-[1.6em] font-bold leading-tight text-balance">
        {title}
      </Title>

      {authors && authors.length > 0 ? (
        <ul className="m-0 mt-6 flex list-none flex-wrap justify-center gap-x-8 gap-y-4 p-0">
          {authors.map((author, i) => (
            <li key={i} data-paper-author="" className="min-w-0 leading-snug">
              <span className="block font-semibold">{author.name}</span>
              {author.affiliation ? (
                <span className="block text-[0.9em] text-muted-foreground">{author.affiliation}</span>
              ) : null}
              {author.email ? (
                <span className="block break-all font-mono text-[0.8em] text-muted-foreground">{author.email}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {meta ? <div className="mt-4 text-[0.9em] text-muted-foreground">{meta}</div> : null}

      {hasAbstract ? (
        <section
          aria-labelledby={abstractId}
          data-paper-abstract=""
          className="mx-auto mt-8 max-w-[34em] text-left text-[0.95em] [&_p]:m-0 [&_p]:text-justify [&_p]:hyphens-auto [&_p+p]:mt-2"
        >
          <h2 id={abstractId} className="m-0 mb-2 text-center text-[1.1em] font-bold">
            {labels.abstract}
          </h2>
          {typeof abstract === "string" ? <p>{abstract}</p> : abstract}
        </section>
      ) : null}
    </header>
  );
}
