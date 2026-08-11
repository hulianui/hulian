"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { useComponentLocale } from "../config/locale-context";
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
  zh: {
    just: "刚刚",
    sec: "秒",
    min: "分钟",
    hour: "小时",
    day: "天",
    month: "个月",
    year: "年",
    ago: "前",
    later: "后",
    yesterday: "昨天",
    tomorrow: "明天",
  },
  en: {
    just: "just now",
    sec: "s",
    min: "m",
    hour: "h",
    day: "d",
    month: "mo",
    year: "y",
    ago: " ago",
    later: "in ",
    yesterday: "yesterday",
    tomorrow: "tomorrow",
  },
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

// SSR/jsdom 安全：浏览器用 layout effect（绘制前切换，肉眼无闪），服务端降级为普通 effect（不执行）。
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const pad = (n: number) => String(n).padStart(2, "0");

/** 纯函数：本地绝对时间 `YYYY-MM-DD HH:mm`（title 用）。 */
export function formatAbsolute(target: Date): string {
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())} ${pad(
    target.getHours(),
  )}:${pad(target.getMinutes())}`;
}

export function RelativeTime({
  value,
  base,
  updateInterval = 60000,
  locale,
  withTitle = true,
  className,
}: RelativeTimeProps) {
  const componentLocale = useComponentLocale();
  const resolvedLocale = locale ?? componentLocale.relativeTime?.locale ?? "zh";
  const target = toDate(value);
  // 受控 base → 固定基准、不 tick；否则「现在」在**挂载后**才取，渲染期一律不读系统时钟（#181 同类）。
  //
  // 渲染期读时钟在 SSR / 静态导出下是把「构建时刻」烤进产物：服务端那次渲染发生在构建时，
  // 页面可能几个月后才被访问，产物里却写死着「1 分钟前」。JS 挂载前的首屏、爬虫、以及关掉
  // JS 的读者拿到的就是这句陈旧且无法自证的假话。`useMemo(fn, [])` 救不了：它只保证一次
  // 渲染树内稳定，服务端与客户端本就是两次独立求值。
  const [now, setNow] = useState<Date | null>(() => (base != null ? toDate(base) : null));

  useIsoLayoutEffect(() => {
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
      // 组件自身已不制造两端差异（首帧不读时钟）；这里只兜消费方传入的 value 本身两端不同的
      // 情况（如 value={new Date()}），避免单个时间戳把整棵树的 hydration 拖崩。
      suppressHydrationWarning
      className={cn("tabular-nums", className)}
    >
      {/* 首帧（= SSR 那一帧）落绝对时间：它只依赖 value，任何时刻都成立，是无 JS 时的正确降级。
          挂载后经 layout effect 在浏览器绘制前换成相对串，用户看到的是「进来就是相对时间」。 */}
      {now == null ? formatAbsolute(target) : formatRelative(target, now, resolvedLocale)}
    </time>
  );
}
