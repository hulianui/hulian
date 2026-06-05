import { TrendingUp, TrendingDown } from "../_icons";
import { cn } from "../lib/cn";
import type { StatProps } from "./stat.types";

// KPI 指标卡：纯瑚琏皮肤（无图表库）。升=text-primary / 降=text-danger（无 success）。
export function Stat({ label, value, delta, deltaLabel, icon, className, ...props }: StatProps) {
  const hasDelta = typeof delta === "number";
  const up = hasDelta && (delta as number) >= 0;
  return (
    <div
      className={cn("rounded-[var(--radius)] border border-border bg-surface p-5", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">{label}</span>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <div className="mt-2 truncate text-2xl font-semibold text-foreground">{value}</div>
      {hasDelta ? (
        // flex-wrap + 子项 whitespace-nowrap：窄容器下「+x% / 标签」整块换行，
        // 不再把数字或 CJK 标签逐字裂行（健壮自适应）。
        <div className={cn("mt-1 flex flex-wrap items-center gap-x-1 text-sm", up ? "text-primary" : "text-danger")}>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            {up ? <TrendingUp className="size-4 shrink-0" /> : <TrendingDown className="size-4 shrink-0" />}
            {up ? "+" : ""}
            {delta}%
          </span>
          {deltaLabel ? <span className="whitespace-nowrap text-muted">{deltaLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
