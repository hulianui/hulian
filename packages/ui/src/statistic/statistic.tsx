"use client";
import { memo, useEffect, useState } from "react";
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
const alignJustify = { start: "justify-start", center: "justify-center", end: "justify-end" } as const;
const alignText = { start: "text-left", center: "text-center", end: "text-right" } as const;

function StatisticImpl({
  title,
  value,
  precision,
  prefix,
  suffix,
  groupSeparator = true,
  animate = false,
  valueStyle,
  align = "start",
  className,
}: StatisticProps) {
  const animated = animate && typeof value === "number";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title && <div className={cn("text-sm text-muted", alignText[align])}>{title}</div>}
      <div className={cn(valueRow, alignJustify[align])} style={valueStyle}>
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
StatisticImpl.displayName = "Statistic";

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

// KPI 区常是一排 Statistic 挤在一个每秒都在动的看板壳里（旁边就有倒计时/轮询），
// 父级一动就整排重算。props 全是原语（title/value/precision/prefix/suffix/...），
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
// 注：valueStyle 是对象 prop，调用方写成内联字面量时每次都是新引用，memo 会照常放行渲染。
const StatisticRoot = memo(StatisticImpl);
StatisticRoot.displayName = "Statistic";

// 复合导出面保持不变：Statistic 可调用、Statistic.Countdown 仍在。
// 只有根组件加 memo —— Countdown 自带每秒 setState，memo 对它没有意义。
export const Statistic = Object.assign(StatisticRoot, { Countdown });
