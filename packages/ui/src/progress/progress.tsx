"use client";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEase, motionEaseCss, LazyMotionProvider, m } from "../motion";
import type { ProgressProps } from "./progress.types";

// value/max → 0..100；indeterminate(undefined/NaN) → null（不定态）
export function progressPercent(value: number | undefined, max: number): number | null {
  if (value === undefined || Number.isNaN(value)) return null;
  if (max <= 0) return 0;
  return Math.min(Math.max(value / max, 0), 1) * 100;
}

// 周长 + 百分比 → SVG stroke-dashoffset
export function dashOffset(circumference: number, percent: number): number {
  return circumference * (1 - percent / 100);
}

// tone → 字面 class（Tailwind @source 只扫字面量，禁动态拼类）
const barByTone = { primary: "bg-primary", danger: "bg-danger" } as const;
const strokeByTone = {
  primary: "stroke-[var(--color-primary)]",
  danger: "stroke-[var(--color-danger)]",
} as const;

// 确定态填充过渡：复用 motion-token CSS 镜像（零散写 transition）
const fillTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

const LOOP = 1.4; // 不定态循环秒数（同 shimmer 手感）

export function Progress({
  value,
  max = 100,
  variant = "linear",
  tone = "primary",
  size = 40,
  thickness = 4,
  showValue = false,
  className,
  ...rest
}: ProgressProps) {
  const reduce = useReducedMotion();
  const pct = progressPercent(value, max);
  const indeterminate = pct === null;

  const aria = {
    role: "progressbar" as const,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    ...(indeterminate ? {} : { "aria-valuenow": value }),
  };

  if (variant === "circular") {
    const r = (size - thickness) / 2;
    const circ = 2 * Math.PI * r;
    const offset = dashOffset(circ, indeterminate ? 25 : (pct as number));
    const spin = indeterminate && !reduce;
    return (
      <div
        {...aria}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...rest}
      >
        <LazyMotionProvider>
        <m.svg
          width={size}
          height={size}
          animate={spin ? { rotate: 360 } : undefined}
          transition={spin ? { repeat: Infinity, duration: LOOP, ease: "linear" } : undefined}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            className="stroke-[var(--color-surface-hover)]"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={strokeByTone[tone]}
            style={{ transitionProperty: "stroke-dashoffset", ...fillTransition }}
          />
        </m.svg>
        </LazyMotionProvider>
        {showValue && !indeterminate && (
          <span className="absolute text-xs font-medium tabular-nums text-foreground">
            {`${Math.round(pct as number)}%`}
          </span>
        )}
      </div>
    );
  }

  // linear
  return (
    <div {...aria} className={cn("flex items-center gap-3", className)} {...rest}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        {indeterminate ? (
          <LazyMotionProvider>
            <m.div
              className={cn("absolute inset-y-0 w-1/3 rounded-full", barByTone[tone])}
              style={reduce ? { left: "33%" } : undefined}
              animate={reduce ? undefined : { x: ["-110%", "320%"] }}
              transition={
                reduce ? undefined : { repeat: Infinity, duration: LOOP, ease: motionEase.inOut }
              }
            />
          </LazyMotionProvider>
        ) : (
          <div
            className={cn("h-full rounded-full", barByTone[tone])}
            style={{ width: `${pct}%`, transitionProperty: "width", ...fillTransition }}
          />
        )}
      </div>
      {showValue && !indeterminate && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
          {`${Math.round(pct as number)}%`}
        </span>
      )}
    </div>
  );
}
