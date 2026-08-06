import { memo } from "react";
import { TrendingUp, TrendingDown } from "../_icons";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import type { StatProps } from "./stat.types";

// KPI 指标卡：纯瑚琏皮肤（无图表库）。升=text-primary / 降=text-danger（无 success）。
function StatImpl({ label, value, delta, deltaLabel, hint, icon, chart, className, ...props }: StatProps) {
  const hasDelta = typeof delta === "number";
  const up = hasDelta && (delta as number) >= 0;
  // deltaLabel 是趋势行的附属文案，无 delta 时整块趋势不渲染 → 它会被静默吞掉。
  // 这种「配了没用、还不报错」的形态最难查（TS 过、控制台干净、页面只是少一行字），
  // 所以开发期显式点名，并指路到 hint（与趋势无关的注脚该走那条）。
  if (deltaLabel != null && !hasDelta) {
    warnOnce(
      "stat/deltaLabel-without-delta",
      "[hulian] Stat 传了 deltaLabel 但没有 delta，它不会被渲染；若想要与趋势无关的注脚请用 hint。",
    );
  }
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
      {chart ? <div className="mt-3">{chart}</div> : null}
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
      {hint != null ? (
        // 排在趋势行之下：趋势是对数值本身的解读，hint 是整张卡的注脚，语义层级更外。
        // 用 text-xs（比趋势行的 text-sm 小一档）拉开视觉层次，避免两行 muted 文字糊成一片。
        <div className="mt-1 text-xs text-muted">{hint}</div>
      ) : null}
    </div>
  );
}
StatImpl.displayName = "Stat";

// KPI 卡永远成行铺（工作台一排 4 张），父级一动就整排重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Stat = memo(StatImpl);
Stat.displayName = "Stat";
