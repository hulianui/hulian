"use client";
import { Fragment, useEffect, useId, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { revealFigure } from "./fig-ref";
import { usePaperContext } from "./paper-context";
import { usePaperLabels } from "./paper-labels";
import type { BibliographyProps, CiteProps } from "./paper.types";

// 参考文献：
//  · Bibliography 按 entries 的顺序编号（第一条 [1]），挂载时把顺序登记进 Paper 的 citations store。
//  · Cite 按 id 从 store 取号：同一处引几条时排序去重，连续三条及以上压成「1–3」，每个号各自是链接。
//    号要等 Bibliography 挂载登记后才有（同 FigRef 的自动图号）；没有 JS 时是普通锚点。
//  · 点击：滚到条目、条目描边闪一下。打印形态下去掉链接色，读起来就是正文里的 [1, 2]。

const EMPTY: ReadonlyMap<string, number> = new Map();
const noopSubscribe = () => () => {};

export function Bibliography({
  entries,
  title,
  titleAs: Title = "h2",
  className,
  ref,
  ...rest
}: BibliographyProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const headingId = useId();
  const register = paper?.citations.register;
  const ids = entries.map((e) => e.id).join("\u0000");

  useEffect(() => {
    if (!register) return;
    return register(ids ? ids.split("\u0000") : []);
  }, [register, ids]);

  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.id)) warnOnce(`Bibliography:dup:${entry.id}`, `[Bibliography] 文献 id "${entry.id}" 重复，引用只会编到第一条。`);
    seen.add(entry.id);
  }

  const heading = title === undefined ? labels.references : title;

  return (
    <section
      {...rest}
      ref={ref}
      data-paper-bibliography=""
      aria-labelledby={heading !== null ? headingId : undefined}
      className={cn("mt-10", className)}
    >
      {heading !== null ? (
        <Title id={headingId} className="m-0 mb-3 text-[1.15em] font-bold">
          {heading}
        </Title>
      ) : null}
      <ol className="m-0 grid list-none gap-2 p-0 text-[0.9em]">
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            id={entry.id}
            data-paper-reference=""
            className={cn(
              "grid scroll-mt-16 grid-cols-[2.4em_minmax(0,1fr)] rounded-sm",
              "ring-offset-4 ring-offset-bg transition-shadow duration-300 data-[highlight]:ring-2 data-[highlight]:ring-primary/40 motion-reduce:transition-none",
            )}
          >
            <span className="tabular-nums">[{i + 1}]</span>
            <span className="min-w-0">{entry.content}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 排序去重后的编号，连续三个及以上压成一段。 */
function groups(numbers: number[]): Array<[number, number]> {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  for (const n of sorted) {
    const last = out[out.length - 1];
    if (last && n === last[1] + 1) last[1] = n;
    else out.push([n, n]);
  }
  // 只有两个相邻号时写成「1, 2」而不是「1–2」。
  return out.flatMap(([a, b]) => (b === a + 1 ? [[a, a], [b, b]] : [[a, b]]) as Array<[number, number]>);
}

export function Cite({ to, className, ref, ...rest }: CiteProps) {
  const paper = usePaperContext();
  const store = paper?.citations;
  const print = paper?.mode === "print";
  const numbers = useSyncExternalStore(store?.subscribe ?? noopSubscribe, () => store?.get() ?? EMPTY, () => EMPTY);
  const ids = typeof to === "string" ? [to] : [...to];

  const known = numbers.size > 0;
  const idOf = new Map<number, string>();
  const missing: string[] = [];
  for (const id of ids) {
    const n = numbers.get(id);
    if (n === undefined) missing.push(id);
    else if (!idOf.has(n)) idOf.set(n, id);
  }
  useEffect(() => {
    if (!known) return;
    for (const id of missing) warnOnce(`Cite:missing:${id}`, `[Cite] 参考文献里没有 id 为 "${id}" 的条目。`);
  });

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!paper || event.defaultPrevented) return;
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    revealFigure(el);
    paper.citations.highlight(id);
  };

  const link = (n: number) => {
    const id = idOf.get(n)!;
    return (
      <a
        href={`#${id}`}
        data-cite={id}
        onClick={(e) => go(e, id)}
        className={cn(
          "rounded-sm",
          print ? "text-inherit no-underline" : "text-primary no-underline hover:underline",
          "print:text-inherit print:no-underline",
        )}
      >
        {n}
      </a>
    );
  };

  let body: ReactNode;
  if (!known) {
    // 编号还没登记（服务端渲染、Bibliography 还没挂载）：先占位，指向第一条。
    body = (
      <a href={`#${ids[0]}`} className="text-inherit no-underline">
        ?
      </a>
    );
  } else {
    const parts = groups([...idOf.keys()]);
    body = (
      <>
        {parts.map(([a, b], i) => (
          <Fragment key={a}>
            {i > 0 ? ", " : null}
            {link(a)}
            {b !== a ? (
              <>
                {"–"}
                {link(b)}
              </>
            ) : null}
          </Fragment>
        ))}
        {missing.length > 0 ? `${parts.length > 0 ? ", " : ""}?` : null}
      </>
    );
  }

  return (
    <span {...rest} ref={ref} data-paper-cite="" className={cn("whitespace-nowrap", className)}>
      [{body}]
    </span>
  );
}
