"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Anchor } from "../anchor";
import type { AnchorItem } from "../anchor/anchor.types";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import { navigatePaper } from "./paper-navigate";
import { usePaperContext, type SectionEntry } from "./paper-context";
import { usePaperLabels } from "./paper-labels";
import type { PaperOutlineProps, PaperOutlineSection, PaperSectionProps, SecRefProps } from "./paper.types";

// 论文章节：自动层级编号（1、2.1、2.1.3），正文引用「第 2.1 节」，目录。
//  · 编号用 CSS 计数器 paper-section（counter-reset 在 Paper 根和每节的正文容器上，counter-increment 在编号的章节上），
//    服务端渲染和打印时都有号，不等 JS。
//  · SecRef / PaperOutline 的号从 Paper 的章节注册表按 DOM 顺序现算，算法与计数器一致。
//  · 嵌套深度靠 DOM 祖先里的 [data-paper-section] 数，标题标签默认按深度取 h2 / h3 / h4。

const DepthContext = createContext(0);

const HEADING = ["h2", "h3", "h4", "h5", "h6"] as const;

const HEADING_CLASS = [
  "mb-3 mt-10 text-[1.2em] font-bold leading-snug",
  "mb-2 mt-7 text-[1.05em] font-bold leading-snug",
  "mb-2 mt-5 text-[1em] font-semibold italic leading-snug",
];

export function PaperSection({
  id,
  title,
  titleAs,
  titleClassName,
  numbered = true,
  className,
  children,
  ref,
  ...rest
}: PaperSectionProps) {
  const paper = usePaperContext();
  const depth = useContext(DepthContext);
  const root = useRef<HTMLElement | null>(null);
  const [highlighted, setHighlighted] = useState(false);

  // 注册一次，句柄里读最新 props。
  const latest = useRef({ title, numbered });
  latest.current = { title, numbered };
  const store = paper?.sections;
  useEffect(() => {
    if (!store) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const entry: SectionEntry = {
      id,
      element: () => root.current,
      title: () => latest.current.title,
      numbered: () => latest.current.numbered,
      highlight() {
        setHighlighted(true);
        clearTimeout(timer);
        timer = setTimeout(() => setHighlighted(false), 1200);
      },
    };
    const unregister = store.register(entry);
    return () => {
      clearTimeout(timer);
      unregister();
    };
  }, [store, id]);

  // 每次提交都通知：标题是 ReactNode，每次渲染都是新对象，比引用没有意义。
  // 订阅方（SecRef / PaperOutline）只是重新取一次列表，不会反过来让章节重渲染。
  useEffect(() => {
    store?.touch();
  });

  const Heading = titleAs ?? HEADING[Math.min(depth, HEADING.length - 1)];
  const nextDepth = useMemo(() => depth + 1, [depth]);

  return (
    <section
      {...rest}
      id={id}
      ref={mergeRefs<HTMLElement>(ref, root)}
      data-paper-section=""
      data-numbered={numbered ? "" : undefined}
      className={cn("scroll-mt-6", numbered && "[counter-increment:paper-section]", className)}
    >
      <Heading
        data-paper-section-title=""
        data-highlight={highlighted ? "" : undefined}
        className={cn(
          HEADING_CLASS[Math.min(depth, HEADING_CLASS.length - 1)],
          "break-after-avoid rounded-sm ring-offset-4 ring-offset-bg transition-shadow duration-300",
          "data-[highlight]:ring-2 data-[highlight]:ring-primary/40 motion-reduce:transition-none",
          titleClassName,
        )}
      >
        {numbered ? (
          <span
            data-paper-section-number=""
            className="mr-[0.6em] tabular-nums before:content-[counters(paper-section,'.')]"
          />
        ) : null}
        {title}
      </Heading>
      <div className="[counter-reset:paper-section]">
        <DepthContext.Provider value={nextDepth}>{children}</DepthContext.Provider>
      </div>
    </section>
  );
}

const noopSubscribe = () => () => {};
const zero = () => 0;

/** 订阅章节注册表，挂载后拿到按文档顺序的章节列表（服务端渲染和首帧为空）。 */
function useSectionList(): PaperOutlineSection[] {
  const store = usePaperContext()?.sections;
  const version = useSyncExternalStore(store?.subscribe ?? noopSubscribe, store?.version ?? zero, zero);
  const [list, setList] = useState<PaperOutlineSection[]>([]);
  useEffect(() => {
    if (store) setList(store.list());
  }, [store, version]);
  return list;
}

export function SecRef({ to, children, className, onClick, ref, ...rest }: SecRefProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const print = paper?.mode === "print";
  const list = useSectionList();
  const target = children === undefined ? list.find((s) => s.id === to) : undefined;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (navigatePaper(paper, { kind: "section", id: to }, "SecRef")) event.preventDefault();
  };

  let text: ReactNode = children;
  if (text === undefined) {
    // 挂载前（服务端渲染）没有号：先给「第 ? 节」占位，和 Cite 的 [?] 一致。
    if (!target) text = labels.section("?");
    else text = target.number === null ? target.title : labels.section(target.number);
  }

  return (
    <a
      {...rest}
      ref={ref}
      href={`#${to}`}
      data-sec-ref=""
      onClick={handleClick}
      className={cn(
        "rounded-sm",
        print
          ? "text-inherit no-underline"
          : "text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary",
        "print:text-inherit print:no-underline",
        className,
      )}
    >
      {text}
    </a>
  );
}

function outlineTitle(section: PaperOutlineSection): ReactNode {
  if (section.number === null) return section.title;
  return (
    <>
      <span className="mr-1.5 tabular-nums">{section.number}</span>
      {section.title}
    </>
  );
}

/**
 * 论文目录：从章节注册表生成，编号与正文标题一致。内部是 `Anchor`（滚动高亮 + 平滑跳转），
 * 放在 `Paper` 里任意位置（一般是侧栏）。打印形态下不渲染。
 */
export function PaperOutline({ depth = 2, className, "aria-label": ariaLabel, ...rest }: PaperOutlineProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const list = useSectionList();

  const items = useMemo(() => {
    const out: AnchorItem[] = [];
    for (const section of list) {
      if (section.depth === 0) out.push({ href: `#${section.id}`, title: outlineTitle(section) });
      else if (section.depth === 1 && depth === 2) {
        const parent = out[out.length - 1];
        if (!parent) continue;
        (parent.children ??= []).push({ href: `#${section.id}`, title: outlineTitle(section) });
      }
    }
    return out;
  }, [list, depth]);

  if (!paper) {
    warnOnce("PaperOutline:outside", "[PaperOutline] 必须放在 Paper 里，否则读不到章节。");
    return null;
  }
  if (paper.mode === "print") return null;

  return (
    <Anchor
      {...rest}
      aria-label={ariaLabel ?? labels.outline}
      data-paper-outline=""
      items={items}
      className={cn("font-sans", className)}
    />
  );
}
