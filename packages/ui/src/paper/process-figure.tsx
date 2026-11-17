"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../button";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { PaperFigure } from "./paper-figure";
import { letterOf, usePaperLabels } from "./paper-labels";
import type {
  FigureRenderContext,
  FigureStepPhase,
  FigureStepProps,
  ProcessFigureProps,
  ProcessStep,
} from "./paper.types";

// 一步步讲的流程图 / 架构图：
//  · 状态就是步骤的 key，外加保留名 "all"（全部亮着，默认的打印态）。
//  · 图里每一部分用 FigureStep 标出属于哪一步。当前步 on、讲过的 done（半透明）、
//    没讲到的 off（很淡，但不隐藏 —— 读者始终看得到整张图的轮廓，知道这一步在全局的哪里）。
//  · FigureStep 是 <g class="group/step">，作者用 group-data-[phase=on]/step: 给当前步上强调色、
//    加流动虚线，组件只管透明度。
//  · 带 until 的部分到 until 那一步起（以及「全部」）被取代、不画：移动的指针、被替换的旧节点。
//  · 打印默认：主图 "all"，下方每一步一张分图。

const ALL = "all";

interface StepContextValue {
  current: string;
  order: readonly string[];
}

const StepContext = createContext<StepContextValue | null>(null);

function phaseOf(at: readonly string[], until: string | undefined, ctx: StepContextValue | null): FigureStepPhase {
  if (!ctx) return "all";
  const index = ctx.order.indexOf(ctx.current);
  if (until !== undefined) {
    const end = ctx.order.indexOf(until);
    if (end < 0) warnOnce(`FigureStep:until:${until}`, `[FigureStep] until="${until}" 不是这张图的步骤。`);
    else if (ctx.current === ALL || index >= end) return "gone";
  }
  if (ctx.current === ALL) return "all";
  if (at.includes(ctx.current)) return "on";
  const done = at.some((key) => {
    const j = ctx.order.indexOf(key);
    return j > -1 && j < index;
  });
  return done ? "done" : "off";
}

/** 标出图里的一部分属于哪一步。`at` 可以是数组，也可以是空格分隔的字符串（`"b c"`）。 */
export function FigureStep({ at, until, className, ...rest }: FigureStepProps) {
  const ctx = useContext(StepContext);
  const list = typeof at === "string" ? at.split(/\s+/).filter(Boolean) : at;
  return (
    <g
      {...rest}
      data-figure-step=""
      data-phase={phaseOf(list, until, ctx)}
      className={cn(
        "group/step transition-opacity duration-300 motion-reduce:transition-none",
        "data-[phase=off]:opacity-15 data-[phase=done]:opacity-50 data-[phase=gone]:hidden",
        className,
      )}
    />
  );
}

function Stepper({
  figure,
  steps,
  overview,
  interval,
}: {
  figure: FigureRenderContext<string>;
  steps: readonly ProcessStep[];
  overview: boolean;
  interval: number;
}) {
  const labels = usePaperLabels();
  const [playing, setPlaying] = useState(false);
  const index = steps.findIndex((s) => s.key === figure.state);
  const last = steps.length - 1;
  const { select } = figure;

  useEffect(() => {
    if (!playing) return;
    if (index === last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => select(steps[index + 1].key), interval);
    return () => clearTimeout(t);
  }, [playing, index, last, interval, select, steps]);

  const go = (key: string) => {
    setPlaying(false);
    select(key);
  };
  const prev = () => go(steps[index < 0 ? last : Math.max(0, index - 1)].key);
  const next = () => go(steps[index < 0 ? 0 : Math.min(last, index + 1)].key);
  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index < 0 || index === last) select(steps[0].key);
    setPlaying(true);
  };

  if (steps.length === 0) return null;
  return (
    <div role="group" aria-label={labels.steps} className="flex flex-wrap items-center gap-1">
      <Button size="xs" variant="outline" onClick={prev} disabled={index === 0} aria-label={labels.prev}>
        ‹
      </Button>
      {steps.map((step, i) => {
        const pressed = step.key === figure.state;
        return (
          <Button
            key={step.key}
            size="xs"
            variant={pressed ? "solid" : "ghost"}
            aria-pressed={pressed}
            aria-label={`(${letterOf(i)}) ${step.label}`}
            title={step.label}
            onClick={() => go(step.key)}
            className="min-w-6 tabular-nums"
          >
            {letterOf(i)}
          </Button>
        );
      })}
      {overview ? (
        <Button
          size="xs"
          variant={figure.state === ALL ? "solid" : "ghost"}
          aria-pressed={figure.state === ALL}
          onClick={() => go(ALL)}
        >
          {labels.overview}
        </Button>
      ) : null}
      <Button size="xs" variant="outline" onClick={next} disabled={index === last} aria-label={labels.next}>
        ›
      </Button>
      <Button size="xs" variant="ghost" onClick={togglePlay} aria-pressed={playing}>
        {playing ? labels.pause : labels.play}
      </Button>
    </div>
  );
}

export function ProcessFigure({
  steps,
  overview = true,
  overviewDescription,
  defaultState,
  printState,
  printSubfigures,
  interval = 2200,
  children,
  ...rest
}: ProcessFigureProps) {
  for (const step of steps) {
    if (step.key === ALL) warnOnce("ProcessFigure:reserved", '[ProcessFigure] 步骤 key 不能用保留名 "all"。');
  }
  const order = useMemo(() => steps.map((s) => s.key), [steps]);
  const byKey = useMemo(() => new Map(steps.map((s) => [s.key, s])), [steps]);
  const states = useMemo(() => {
    const out: Record<string, string> = {};
    for (const key of order) out[key] = key;
    if (overview) out[ALL] = ALL;
    return out;
  }, [order, overview]);

  return (
    <PaperFigure<string>
      {...rest}
      states={states}
      defaultState={defaultState ?? order[0]}
      printState={printState ?? (overview ? ALL : order[order.length - 1])}
      printSubfigures={printSubfigures ?? order}
      describe={(key) => (key === ALL ? overviewDescription : byKey.get(key)?.description)}
      subfigureLabel={(key, i) => `(${letterOf(i)}) ${byKey.get(key)?.label ?? key}`}
      controls={(figure) => (
        <Stepper figure={figure} steps={steps} overview={overview} interval={interval} />
      )}
    >
      {(step) => <StepContext.Provider value={{ current: step, order }}>{children}</StepContext.Provider>}
    </PaperFigure>
  );
}
