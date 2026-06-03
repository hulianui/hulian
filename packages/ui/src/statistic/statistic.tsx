"use client";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { NumberTicker } from "../number-ticker/number-ticker";
import type { CountdownProps, StatisticProps } from "./statistic.types";

// 统计数值 + 倒计时（与 Stat KPI 卡互补：Stat 偏卡片态势，Statistic 偏裸数值/倒计时）。
// 纯函数 formatStatistic/formatCountdown 独立可单测（同 NumberTicker 的 formatTicker 范式）。

/** 数值格式化：number → 千分位 + precision；string 原样返回。 */
export function formatStatistic(value: number | string, precision?: number, group = true): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-US", {
    useGrouping: group,
    ...(precision !== undefined && {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }),
  }).format(value);
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

/** 毫秒 → 按模板格式化倒计时。含 D 时 H 为「天内小时」，否则为总小时数。负数 clamp 到 0。 */
export function formatCountdown(ms: number, format = "HH:mm:ss"): string {
  const total = Math.max(0, Math.floor(ms));
  const hasDay = format.includes("D");
  const days = Math.floor(total / 86_400_000);
  const totalHours = Math.floor(total / 3_600_000);
  const hours = hasDay ? Math.floor((total % 86_400_000) / 3_600_000) : totalHours;
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1_000);
  const millis = total % 1_000;
  // 长 token 先替换（替换值是纯数字，不会撞到后续 token 字母）。
  return format
    .replace(/SSS/g, pad(millis, 3))
    .replace(/SS/g, pad(Math.floor(millis / 10), 2))
    .replace(/S/g, String(Math.floor(millis / 100)))
    .replace(/D/g, String(days))
    .replace(/HH/g, pad(hours))
    .replace(/H/g, String(hours))
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, String(seconds));
}

const valueRow = "flex items-baseline gap-1 text-2xl font-semibold text-foreground tabular-nums";
const affix = "text-base font-normal";

export function Statistic({
  title,
  value,
  precision,
  prefix,
  suffix,
  groupSeparator = true,
  animate = false,
  valueStyle,
  className,
}: StatisticProps) {
  const animated = animate && typeof value === "number";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title && <div className="text-sm text-muted">{title}</div>}
      <div className={valueRow} style={valueStyle}>
        {prefix && <span className={affix}>{prefix}</span>}
        <span>
          {animated ? (
            <NumberTicker value={value as number} decimalPlaces={precision ?? 0} />
          ) : (
            formatStatistic(value, precision, groupSeparator)
          )}
        </span>
        {suffix && <span className={cn(affix, "text-muted")}>{suffix}</span>}
      </div>
    </div>
  );
}

function Countdown({
  title,
  deadline,
  format = "HH:mm:ss",
  prefix,
  suffix,
  onFinish,
  valueStyle,
  className,
}: CountdownProps) {
  // 初值 null：SSR 与首次客户端渲染一致（都渲零占位），避免 hydration mismatch；
  // Date.now() 只在客户端 effect 内读，不在渲染期 → SSR 安全。
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let finished = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      setRemaining(left);
      if (left <= 0 && !finished) {
        finished = true;
        onFinish?.();
        if (timer) clearInterval(timer);
      }
    };
    tick(); // 挂载即算一次，避免等满 1s 才显示
    if (!finished) timer = setInterval(tick, 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [deadline, onFinish]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title && <div className="text-sm text-muted">{title}</div>}
      <div className={valueRow} style={valueStyle}>
        {prefix && <span className={affix}>{prefix}</span>}
        <span>{formatCountdown(remaining ?? 0, format)}</span>
        {suffix && <span className={cn(affix, "text-muted")}>{suffix}</span>}
      </div>
    </div>
  );
}

Statistic.Countdown = Countdown;
