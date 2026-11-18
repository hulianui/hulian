"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../button";
import { RefreshCw } from "../_icons";
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

/** 倍速档位默认值。1× 就是 `interval` 原速，0.5× 慢一半，2× 快一倍。 */
const DEFAULT_SPEEDS: readonly number[] = [0.5, 1, 1.5, 2];

/** 倍速再快也留一口气：太快时读者只看见画面在闪，反而不知道发生了什么。 */
const MIN_STEP_MS = 120;

const loopingPress = "aria-pressed:bg-primary-subtle aria-pressed:text-primary";

/** 读者在系统里要求减弱动效时，自动开播也一并让路（播放按钮照常可用）。 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function formatSpeed(speed: number): string {
  return `${speed}×`;
}

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
  autoPlay,
  loop,
  speeds,
  defaultSpeed,
}: {
  figure: FigureRenderContext<string>;
  steps: readonly ProcessStep[];
  overview: boolean;
  interval: number;
  autoPlay: boolean;
  loop: boolean;
  speeds: readonly number[];
  defaultSpeed: number | undefined;
}) {
  const labels = usePaperLabels();
  const speedList = speeds.length > 0 ? speeds : [1];
  const [speed, setSpeed] = useState(() => {
    if (defaultSpeed !== undefined && speedList.includes(defaultSpeed)) return defaultSpeed;
    return speedList.includes(1) ? 1 : speedList[0];
  });
  // 循环是「播放方式」，不是受控值：初值来自 props，之后读者自己开关。
  const [looping, setLooping] = useState(loop);
  const [playing, setPlaying] = useState(false);
  // 读者一碰控件就接管播放：之后的自动开播不再抢回来（滚回视口也不恢复）。
  const userPaused = useRef(false);
  // 上一次是播放器自己切的哪一步。用于分辨「外面切过来的」—— 正文里的 FigRef、
  // usePaperNavigate、演示里翻页都算读者接管，自动播放该让位，不能把人家选的那步刷走。
  const selfSelected = useRef<string | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const index = steps.findIndex((s) => s.key === figure.state);
  const last = steps.length - 1;
  const { select } = figure;
  const stepMs = Math.max(MIN_STEP_MS, Math.round(interval / speed));

  // 一帧一步：到最后一步时按 loop 决定回卷还是收工。
  // index < 0 = 停在「全部」上开播，先走进第一步，别让读者对着不动的图等一个 interval。
  useEffect(() => {
    if (!playing) return;
    if (steps.length === 0) {
      setPlaying(false);
      return;
    }
    if (index < 0) {
      selfSelected.current = steps[0].key;
      select(steps[0].key);
      return;
    }
    const atEnd = index >= last;
    if (atEnd && !looping) {
      setPlaying(false);
      return;
    }
    const nextKey = steps[atEnd ? 0 : index + 1].key;
    const timer = setTimeout(() => {
      selfSelected.current = nextKey;
      select(nextKey);
    }, stepMs);
    return () => clearTimeout(timer);
  }, [playing, index, last, looping, select, steps, stepMs]);

  // 状态被播放器之外的东西改变（正文引用、卡片上的「定位阶段」、演示翻页）→ 读者接管：
  // 正在播就停下，还没开播（autoPlay 的图刚滚到一半）也不再自动开始 —— 人家已经选好要看哪一步了。
  // 只认「跳变」：开播那一刻不算，否则一开播就自己把自己停了；播放器自己切的那步也不算。
  const previousIndex = useRef(index);
  useEffect(() => {
    const changed = previousIndex.current !== index;
    previousIndex.current = index;
    if (!changed || index < 0) return;
    if (steps[index]?.key === selfSelected.current) return;
    userPaused.current = true;
    setPlaying(false);
  }, [index, steps]);

  // 自动开播：图进视口才开始（首页那种一进页面就播、读者还没滚到的图不会白播一遍），
  // 滚出视口先停下省计时器，滚回来接着播。没有 IntersectionObserver 的环境里直接就播。
  useEffect(() => {
    if (!autoPlay || figure.presenting || prefersReducedMotion()) return;
    const host = hostRef.current;
    const target = host?.closest("figure") ?? host;
    if (!target) return;
    if (typeof IntersectionObserver === "undefined") {
      setPlaying(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry || userPaused.current) return;
        setPlaying(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [autoPlay]);

  const go = useCallback(
    (key: string) => {
      userPaused.current = true;
      setPlaying(false);
      select(key);
    },
    [select],
  );
  const prev = () => go(steps[index < 0 ? last : Math.max(0, index - 1)].key);
  const next = () => go(steps[index < 0 ? 0 : Math.min(last, index + 1)].key);
  const togglePlay = () => {
    if (playing) {
      userPaused.current = true;
      setPlaying(false);
      return;
    }
    userPaused.current = false;
    // 停在「全部」或最后一步时按播放：从第一步重新讲一遍。
    if (index < 0 || index >= last) {
      selfSelected.current = steps[0].key;
      select(steps[0].key);
    }
    setPlaying(true);
  };
  const cycleSpeed = () => {
    if (speedList.length < 2) return;
    const at = speedList.indexOf(speed);
    setSpeed(speedList[(at + 1) % speedList.length]);
  };

  if (steps.length === 0) return null;
  return (
    <div
      ref={hostRef}
      role="group"
      aria-label={labels.steps}
      className="flex flex-wrap items-center gap-1"
    >
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
      <Button
        size="xs"
        variant="ghost"
        aria-pressed={looping}
        aria-label={labels.loop}
        title={labels.loop}
        onClick={() => setLooping((on) => !on)}
        className={cn("size-6 shrink-0 px-0", loopingPress)}
      >
        <RefreshCw className="size-3.5" />
      </Button>
      {speedList.length > 1 ? (
        <Button
          size="xs"
          variant="ghost"
          onClick={cycleSpeed}
          aria-label={`${labels.speed} ${formatSpeed(speed)}`}
          title={`${labels.speed} ${formatSpeed(speed)}`}
          className="min-w-9 shrink-0 px-1.5 tabular-nums"
        >
          {formatSpeed(speed)}
        </Button>
      ) : null}
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
  autoPlay = false,
  loop = false,
  speeds = DEFAULT_SPEEDS,
  defaultSpeed,
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
        <Stepper
          figure={figure}
          steps={steps}
          overview={overview}
          interval={interval}
          autoPlay={autoPlay}
          loop={loop}
          speeds={speeds}
          defaultSpeed={defaultSpeed}
        />
      )}
    >
      {(step) => <StepContext.Provider value={{ current: step, order }}>{children}</StepContext.Provider>}
    </PaperFigure>
  );
}
