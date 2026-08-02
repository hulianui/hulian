"use client";

import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale";
import { computeFunnel } from "./funnel-geometry";
import type { FunnelProps, FunnelStage, FunnelTone } from "./funnel.types";

// 条的填充色吃 token，按 per-stage tone 切换；缺省 brand。
const TONE_BAR: Record<FunnelTone, string> = {
  neutral: "bg-muted",
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

// 条上文字（label/value）对应 tone 的前景色，保证对比度。
const TONE_FG: Record<FunnelTone, string> = {
  neutral: "text-foreground",
  brand: "text-primary-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-danger-foreground",
};

function pct(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function conversionText(conversion: number): string {
  return `${(conversion * 100).toFixed(1)}%`;
}

export function Funnel<S extends FunnelStage>({
  stages,
  orientation = "vertical",
  showConversion = true,
  renderStage,
  onStageClick,
  className,
}: FunnelProps<S>) {
  const locale = useComponentLocale().funnel;
  const data = computeFunnel(stages);
  const clickable = typeof onStageClick === "function";

  if (orientation === "horizontal") {
    return (
      <div
        className={cn("flex items-end gap-2", className)}
        role="list"
        aria-label={locale?.chart ?? "漏斗图"}
      >
        {data.map(({ stage, widthRatio, conversion }, i) => {
          const tone = stage.tone ?? "brand";
          const content = renderStage ? (
            renderStage(stage, { widthRatio, conversion, index: i })
          ) : (
            <>
              <span className={cn("text-sm font-semibold", TONE_FG[tone])}>{stage.value}</span>
              <span className={cn("text-xs opacity-90", TONE_FG[tone])}>{stage.label}</span>
            </>
          );
          return (
            <div key={stage.id} className="flex flex-1 flex-col items-center gap-1.5" role="listitem">
              {showConversion && conversion !== null ? (
                <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted">
                  {conversionText(conversion)}
                </span>
              ) : (
                showConversion && <span className="h-[18px]" aria-hidden />
              )}
              <div className="flex h-40 w-full items-end justify-center">
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onStageClick?.(stage)}
                    style={{ height: pct(widthRatio) }}
                    className={cn(
                      "flex min-h-7 w-full flex-col items-center justify-center gap-0.5 rounded-[var(--radius)] px-1 transition-opacity hover:opacity-85",
                      TONE_BAR[tone],
                    )}
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    style={{ height: pct(widthRatio) }}
                    className={cn(
                      "flex min-h-7 w-full flex-col items-center justify-center gap-0.5 rounded-[var(--radius)] px-1",
                      TONE_BAR[tone],
                    )}
                  >
                    {content}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // vertical：每级一行，居中梯形条按宽度比，级间显转化率徽标。
  return (
    <div className={cn("flex flex-col gap-2", className)} role="list" aria-label={locale?.chart ?? "漏斗图"}>
      {data.map(({ stage, widthRatio, conversion }, i) => {
        const tone = stage.tone ?? "brand";
        const content = renderStage ? (
          renderStage(stage, { widthRatio, conversion, index: i })
        ) : (
          <>
            <span className={cn("truncate text-sm font-medium", TONE_FG[tone])}>{stage.label}</span>
            <span className={cn("text-sm font-semibold tabular-nums", TONE_FG[tone])}>{stage.value}</span>
          </>
        );
        const bar = clickable ? (
          <button
            type="button"
            onClick={() => onStageClick?.(stage)}
            style={{ width: pct(widthRatio) }}
            className={cn(
              "flex min-w-[4rem] items-center justify-between gap-3 rounded-[var(--radius)] px-3 py-2 transition-opacity hover:opacity-85",
              TONE_BAR[tone],
            )}
          >
            {content}
          </button>
        ) : (
          <div
            style={{ width: pct(widthRatio) }}
            className={cn(
              "flex min-w-[4rem] items-center justify-between gap-3 rounded-[var(--radius)] px-3 py-2",
              TONE_BAR[tone],
            )}
          >
            {content}
          </div>
        );
        return (
          <div key={stage.id} role="listitem">
            {showConversion && conversion !== null ? (
              <div className="mb-1 flex justify-center">
                <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted">
                  {locale?.conversion ?? "转化"} {conversionText(conversion)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-center">{bar}</div>
          </div>
        );
      })}
    </div>
  );
}
