"use client";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { usePaperContext, type FigureEntry, type FigureView } from "./paper-context";
import { serializeSvg } from "./svg-export";
import type { FigureRenderContext, FigureSvgExportOptions, PaperExport } from "./paper.types";

// 逐状态导出 SVG：
//  · 不动正文里的图。Paper 根节点里临时挂一个屏幕外的槽，用图的同一个「状态 → 画面」函数画出
//    要导出的那个预设 —— 它仍在 Paper 的 React 树和 DOM 里，context、继承来的衬线字体都在。
//  · 槽默认标 data-theme="light"：投稿要的是白纸上的图，读者此刻开着暗色也照样导出亮色。
//    text-foreground 在槽上重算一次，否则 currentColor 会继承 Paper 根上已经按暗色算好的值。
//  · 槽里关掉动画和过渡：流动虚线、透明度过渡的中间帧不能进投稿图。
//  · 等字体就绪、再等两帧（让 ResizeObserver 一类的测量落定），然后交给 serializeSvg 内联计算样式。
//  · 画面的 mode 是 "print"：导出和打印是同一种语义 —— 一张定格的、给纸面用的图。

interface Job {
  uid: number;
  id: string;
  key: string;
  view: FigureView;
  width: number;
  options: FigureSvgExportOptions;
  resolve: (svg: string) => void;
  reject: (error: Error) => void;
}

export interface ExportHandle {
  run: (entry: FigureEntry, key: string, options: FigureSvgExportOptions) => Promise<string>;
}

const FALLBACK_WIDTH = 720;
const noop = () => {};

function nextFrame() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 16);
  });
}

function Slot({ job, onDone }: { job: Job; onDone: (uid: number) => void }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts?.ready;
        await nextFrame();
        await nextFrame();
        if (cancelled) return;
        const children = box.current ? [...box.current.children] : [];
        const svg = children[0];
        if (children.length !== 1 || !(svg instanceof SVGSVGElement)) {
          throw new Error(
            `[Paper] 图 "${job.id}" 的画面不是单独一个 <svg>（实际是 ${children.map((c) => `<${c.tagName.toLowerCase()}>`).join("") || "空"}），无法导出 SVG。canvas 栅格请改用 FigureRaster 画在图的 <svg> 里。`,
          );
        }
        job.resolve(serializeSvg(svg, { width: job.options.width, background: job.options.background }));
      } catch (error) {
        if (!cancelled) job.reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (!cancelled) onDone(job.uid);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [job, onDone]);

  const figure: FigureRenderContext<unknown> = {
    state: job.view.states[job.key],
    stateKey: job.key,
    select: noop,
    setState: noop,
    mode: "print",
  };

  return (
    <div
      ref={(el) => {
        // inert 走 DOM：React 18 的类型里还没有这个属性。槽在屏幕外，不能被 Tab 到。
        el?.setAttribute("inert", "");
      }}
      aria-hidden
      data-paper-export={job.id}
      data-theme={job.options.theme === "current" ? undefined : "light"}
      className="pointer-events-none fixed top-0 text-foreground [&_*]:![animation:none] [&_*]:![transition:none]"
      style={{ left: -100000, width: job.width }}
    >
      <div ref={box}>{job.view.render(job.view.states[job.key], figure)}</div>
    </div>
  );
}

/** Paper 内部：导出时临时挂载图的屏幕外槽。没有导出任务时什么都不渲染。 */
export function PaperExportHost({ handle }: { handle: MutableRefObject<ExportHandle | null> }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const pending = useRef(new Set<Job>());
  const seq = useRef(0);

  const done = useCallback((uid: number) => {
    setJobs((list) => list.filter((j) => j.uid !== uid));
  }, []);

  useEffect(() => {
    const live = pending.current;
    handle.current = {
      run(entry, key, options) {
        return new Promise<string>((resolve, reject) => {
          const body = entry.element()?.querySelector<HTMLElement>("[data-paper-figure-body]");
          const job: Job = {
            uid: ++seq.current,
            id: entry.id,
            key,
            view: entry.view(),
            width: body?.clientWidth || FALLBACK_WIDTH,
            options,
            resolve: (svg) => {
              live.delete(job);
              resolve(svg);
            },
            reject: (error) => {
              live.delete(job);
              reject(error);
            },
          };
          live.add(job);
          setJobs((list) => [...list, job]);
        });
      },
    };
    return () => {
      handle.current = null;
      // Paper 卸载时还没画完的导出不能永远挂着。
      for (const job of [...live]) job.reject(new Error(`[Paper] 导出图 "${job.id}" 时 Paper 已卸载。`));
    };
  }, [handle]);

  if (jobs.length === 0) return null;
  return (
    <div data-paper-export-host="" className="print:hidden">
      {jobs.map((job) => (
        <Slot key={job.uid} job={job} onDone={done} />
      ))}
    </div>
  );
}

/**
 * 在 `Paper` 内部把某张图的某个预设导出成独立的 SVG 文本（投稿：插进 Word，或转 PDF 进 LaTeX）。
 * 在 `Paper` 外调用时，`exportFigureSvg` 总是 reject。
 */
export function usePaperExport(): PaperExport {
  const paper = usePaperContext();
  const run = paper?.exportFigureSvg;
  const exportFigureSvg = useCallback<PaperExport["exportFigureSvg"]>(
    (id, stateKey, options) =>
      run ? run(id, stateKey, options) : Promise.reject(new Error("[Paper] usePaperExport 必须在 Paper 里使用。")),
    [run],
  );
  return { exportFigureSvg };
}
