"use client";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import type { RelativeTimeLocale, RelativeTimeProps } from "./relative-time.types";

// 相对时间（timeago）：把时间戳渲成「3 分钟前 / 昨天 / 2 个月后」并随时间自动刷新。
// 核心格式化抽成纯函数 formatRelative(target, now, locale) 便于单测，组件只管 tick 与 a11y。

const toDate = (v: Date | string | number): Date => (v instanceof Date ? v : new Date(v));

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 2592000; // 30d
const YEAR = 31536000; // 365d

const UNIT = {
  zh: { just: "刚刚", sec: "秒", min: "分钟", hour: "小时", day: "天", month: "个月", year: "年", ago: "前", later: "后", yesterday: "昨天", tomorrow: "明天" },
  en: { just: "just now", sec: "s", min: "m", hour: "h", day: "d", month: "mo", year: "y", ago: " ago", later: "in ", yesterday: "yesterday", tomorrow: "tomorrow" },
} as const;

/** 纯函数：target 相对 now 的本地化相对时间串（可单测）。 */
export function formatRelative(target: Date, now: Date, locale: RelativeTimeLocale = "zh"): string {
  const t = UNIT[locale];
  const diffMs = target.getTime() - now.getTime();
  const future = diffMs > 0;
  const sec = Math.abs(diffMs) / 1000;

  if (sec < 5) return t.just;

  const wrap = (n: number, unit: string) =>
    locale === "zh"
      ? `${n}${unit}${future ? t.later : t.ago}`
      : future
        ? `${t.later}${n}${unit}`
        : `${n}${unit}${t.ago}`;

  if (sec < MINUTE) return wrap(Math.floor(sec), t.sec);
  if (sec < HOUR) return wrap(Math.floor(sec / MINUTE), t.min);
  if (sec < DAY) return wrap(Math.floor(sec / HOUR), t.hour);

  const days = Math.floor(sec / DAY);
  if (days === 1) return future ? t.tomorrow : t.yesterday;
  if (sec < MONTH) return wrap(days, t.day);
  if (sec < YEAR) return wrap(Math.floor(sec / MONTH), t.month);
  return wrap(Math.floor(sec / YEAR), t.year);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 纯函数：本地绝对时间 `YYYY-MM-DD HH:mm`（title 用）。 */
export function formatAbsolute(target: Date): string {
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())} ${pad(target.getHours())}:${pad(target.getMinutes())}`;
}

export function RelativeTime({
  value,
  base,
  updateInterval = 60000,
  locale = "zh",
  withTitle = true,
  className,
}: RelativeTimeProps) {
  const target = toDate(value);
  // 受控 base → 固定基准、不 tick；否则实时 now 并定时刷新。
  const [now, setNow] = useState<Date>(() => (base != null ? toDate(base) : new Date()));

  useEffect(() => {
    if (base != null) {
      setNow(toDate(base));
      return;
    }
    setNow(new Date());
    if (!updateInterval) return;
    const id = setInterval(() => setNow(new Date()), updateInterval);
    return () => clearInterval(id);
    // base 为对象/字符串/数值时按值比较交给消费者保持稳定
  }, [base, updateInterval]);

  return (
    <time
      dateTime={target.toISOString()}
      title={withTitle ? formatAbsolute(target) : undefined}
      // 服务端渲染的相对串与客户端 hydration 时刻必然有秒级差 → 抑制该 <time> 的 hydration 警告
      suppressHydrationWarning
      className={cn("tabular-nums", className)}
    >
      {formatRelative(target, now, locale)}
    </time>
  );
}
