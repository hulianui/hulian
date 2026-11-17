"use client";
/// <reference path="../math/katex-css.d.ts" />
import "katex/dist/katex.min.css";
import katex from "katex";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import { revealTarget } from "./paper-navigate";
import { usePaperContext, type EquationNumbering } from "./paper-context";
import type { EquationTerm, PaperEquationProps } from "./paper.types";

// 论文里的公式，某几项能和图联动（只从 @hulianui/ui/math 导出：KaTeX 不进主入口）。
//
//  · 标记：LaTeX 里写 \term{dk}{\sqrt{d_k}}，宏展开成 \htmlData{paper-term=dk}{…}，
//    KaTeX 在那一项外面包一个带 data-paper-term 的 span。\htmlData 要 trust 才放行，
//    这里的 trust 只认「\htmlData 且唯一的属性是 paper-term、值是安全的名字」，
//    \href、\htmlClass、\includegraphics 等其余要 trust 的命令照旧拒绝。
//  · 可达性：KaTeX 的 HTML 层整体 aria-hidden（读屏读的是并排的 MathML），项本身不能聚焦。
//    所以在每一项上面叠一个透明的真 <button>（按测出的位置绝对定位）：鼠标、键盘、读屏都点得到，
//    焦点环画在项上。尺寸变化、字体加载后重新测。
//  · 高亮：悬停 / 聚焦项时写 Paper 的 term store，图里用 usePaperTerm 绑定的控件跟着亮；
//    反过来，控件被悬停 / 聚焦时，公式里同名的项加 data-active。
//  · 打印形态下叠层不渲染，项也不带可点的样式。
//  · 编号：在 Paper 里不传 number 时占 CSS 计数器 paper-equation 的一个号（服务端渲染、打印都有号）；
//    传值是手写覆盖，不占号（同 LaTeX \tag）；null / false 不编号。所有公式都登记进 Paper 的公式注册表，
//    EqRef 按文档顺序数自动编号的公式取号，和计数器的顺序一致。

const NAME = /^[\w-]+$/;
const TERM_MACRO = "\\htmlData{paper-term=#1}{#2}";

function trust(ctx: { command: string; attributes?: Record<string, string> }) {
  if (ctx.command !== "\\htmlData" || !ctx.attributes) return false;
  const keys = Object.keys(ctx.attributes);
  return keys.length === 1 && keys[0] === "data-paper-term" && NAME.test(ctx.attributes["data-paper-term"]);
}

function render(src: string, display: boolean, macros?: Record<string, string>) {
  return katex.renderToString(src, {
    displayMode: display,
    throwOnError: false,
    errorColor: "var(--color-danger)",
    strict: "ignore",
    output: "htmlAndMathml",
    trust,
    // 浅拷贝：KaTeX 会把 \def 写回宏表，不能污染消费方的常量。
    macros: { ...macros, "\\term": TERM_MACRO },
  });
}

interface Spot {
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const HIGHLIGHT_MS = 1200;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const noopSubscribe = () => () => {};

export function PaperEquation({
  children,
  terms,
  number,
  display = true,
  macros,
  className,
  id,
  ref,
  ...rest
}: PaperEquationProps) {
  const paper = usePaperContext();
  const auto = number === undefined && paper !== null;
  const manual = number !== undefined && number !== null && number !== false;
  const store = paper?.terms;
  const print = paper?.mode === "print";
  const html = useMemo(() => render(children, display, macros), [children, display, macros]);

  const box = useRef<HTMLDivElement>(null);
  const [spots, setSpots] = useState<Spot[]>([]);

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const base = el.getBoundingClientRect();
    const next: Spot[] = [];
    for (const node of el.querySelectorAll<HTMLElement>("[data-paper-term]")) {
      const r = node.getBoundingClientRect();
      next.push({
        name: node.dataset.paperTerm ?? "",
        left: r.left - base.left,
        top: r.top - base.top,
        width: r.width,
        height: r.height,
      });
    }
    setSpots((prev) =>
      prev.length === next.length &&
      prev.every(
        (p, i) =>
          p.name === next[i].name &&
          p.left === next[i].left &&
          p.top === next[i].top &&
          p.width === next[i].width &&
          p.height === next[i].height,
      )
        ? prev
        : next,
    );
  }, []);

  useIsoLayoutEffect(() => {
    measure();
  }, [html, measure]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    if (typeof ResizeObserver === "undefined") return () => {
      alive = false;
    };
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [measure]);

  // 公式里写了、terms 没配的项，或 terms 配了、公式里没有的项：开发期各告警一次。
  const names = useMemo(() => [...new Set(spots.map((s) => s.name))], [spots]);
  useEffect(() => {
    for (const name of names) {
      if (!terms?.[name]) warnOnce(`PaperEquation:term:${name}`, `[PaperEquation] 公式里的 \\term{${name}} 没有在 terms 里配置，只能悬停高亮。`);
    }
  }, [names, terms]);

  // 高亮：从 store 读当前项，直接改 KaTeX 生成的 span（它们不归 React 管）。
  const active = useSyncExternalStore(store?.subscribe ?? noopSubscribe, () => store?.get() ?? null, () => null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    for (const node of el.querySelectorAll<HTMLElement>("[data-paper-term]")) {
      if (!print && node.dataset.paperTerm === active) node.setAttribute("data-active", "");
      else node.removeAttribute("data-active");
    }
  }, [active, html, print]);

  // 公式注册表：注册一次，编号方式从 ref 里读最新的；每次提交 touch 一下，让 EqRef 重新取号。
  const root = useRef<HTMLDivElement>(null);
  const numberingRef = useRef<EquationNumbering>({ auto: true });
  numberingRef.current = auto ? { auto: true } : { auto: false, label: manual ? number : null };
  const [highlighted, setHighlighted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const highlight = useCallback(() => {
    clearTimeout(timer.current);
    setHighlighted(true);
    timer.current = setTimeout(() => setHighlighted(false), HIGHLIGHT_MS);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const equations = paper?.equations;
  useEffect(() => {
    if (!equations) return;
    return equations.register({
      id,
      element: () => root.current,
      numbering: () => numberingRef.current,
      highlight,
    });
  }, [equations, id, highlight]);
  useEffect(() => {
    equations?.touch();
  });

  const enter = (name: string) => store?.set(name);
  const leave = (name: string) => {
    if (store?.get() === name) store.set(null);
  };

  const activate = (name: string, term: EquationTerm) => {
    if (!term.figure) return;
    const entry = paper?.find(term.figure);
    if (!entry) {
      warnOnce(`PaperEquation:figure:${term.figure}`, `[PaperEquation] 找不到 id 为 "${term.figure}" 的图（项 ${name}）。`);
      return;
    }
    if (typeof term.state === "string") {
      if (entry.has(term.state)) entry.select(term.state);
      else warnOnce(`PaperEquation:state:${term.figure}:${term.state}`, `[PaperEquation] 图 "${term.figure}" 没有名为 "${term.state}" 的预设。`);
    } else if (typeof term.state === "function") {
      entry.setState(term.state(entry.getState()));
    }
    const el = entry.element();
    if (el) revealTarget(el);
    entry.highlight();
  };

  return (
    <div
      {...rest}
      id={id}
      ref={mergeRefs<HTMLDivElement>(ref, root)}
      data-paper-equation=""
      data-mode={print ? "print" : "read"}
      data-highlight={highlighted ? "" : undefined}
      className={cn(
        "my-4 flex min-w-0 items-center gap-4 break-inside-avoid rounded-[var(--radius)]",
        "ring-offset-4 ring-offset-bg transition-shadow duration-300 data-[highlight]:ring-2 data-[highlight]:ring-primary/40 motion-reduce:transition-none",
        auto && "[counter-increment:paper-equation]",
        className,
      )}
    >
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div ref={box} className="relative mx-auto w-fit max-w-none">
          <div
            className={cn(
              "[&_.katex-display]:my-0",
              "[&_[data-paper-term]]:rounded-sm [&_[data-paper-term]]:transition-colors [&_[data-paper-term]]:duration-150 motion-reduce:[&_[data-paper-term]]:transition-none",
              "[&_[data-paper-term][data-active]]:bg-primary/10 [&_[data-paper-term][data-active]]:text-primary",
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {!print
            ? spots.map((spot, i) => {
                const term = terms?.[spot.name];
                const style = { left: spot.left, top: spot.top, width: spot.width, height: spot.height };
                const hover = {
                  onPointerEnter: () => enter(spot.name),
                  onPointerLeave: () => leave(spot.name),
                };
                if (term?.figure) {
                  return (
                    <button
                      key={`${spot.name}-${i}`}
                      type="button"
                      data-paper-term-button={spot.name}
                      aria-label={term.label}
                      title={term.label}
                      style={style}
                      {...hover}
                      onFocus={() => enter(spot.name)}
                      onBlur={() => leave(spot.name)}
                      onClick={() => activate(spot.name, term)}
                      className="absolute cursor-pointer rounded-sm border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden"
                    />
                  );
                }
                return (
                  <span
                    key={`${spot.name}-${i}`}
                    aria-hidden
                    title={term?.label}
                    style={style}
                    {...hover}
                    className="absolute print:hidden"
                  />
                );
              })
            : null}
        </div>
      </div>
      {auto ? (
        <span data-paper-equation-number="auto" className="shrink-0 tabular-nums">
          (<span className="before:content-[counter(paper-equation)]" />)
        </span>
      ) : manual ? (
        <span data-paper-equation-number="" className="shrink-0 tabular-nums">
          ({number})
        </span>
      ) : null}
    </div>
  );
}
