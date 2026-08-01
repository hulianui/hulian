// DateTimePicker 的值拆合与边界换算。
//
// 对外值是 `"YYYY-MM-DD HH:mm"`（或带秒），中间一个空格。定宽 → 字典序即时间序，
// 于是 minDateTime/maxDateTime 的比较、以及下面的「当天时间边界」推导全都是字符串运算，
// 一个 Date 对象都不用造，也就没有时区与 UTC 日界的坑。

export interface DateTimeParts {
  /** `"YYYY-MM-DD"`，没选日期时为 null */
  date: string | null;
  /** `"HH:mm"` 或 `"HH:mm:ss"`，没选时间时为 null */
  time: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

/** 拆值。日期段不合法就整体作废（时间脱离日期没有意义）；时间段不合法则只丢时间。 */
export function splitDateTime(value: string | null | undefined): DateTimeParts {
  if (!value) return { date: null, time: null };
  const [date, time] = value.trim().split(/\s+/);
  if (!date || !DATE_RE.test(date)) return { date: null, time: null };
  return { date, time: time && TIME_RE.test(time) ? time : null };
}

/** 合值。**没有日期就没有值** —— 光有时间是半截数据，不该流到业务里。 */
export function joinDateTime(date: string | null, time: string | null, withSeconds: boolean): string | null {
  if (!date) return null;
  const t = time ?? (withSeconds ? "00:00:00" : "00:00");
  // 形状对齐 withSeconds：`"09:30"` 在带秒模式下补 `:00`，反之砍掉秒
  const [h = "00", m = "00", s = "00"] = t.split(":");
  return `${date} ${withSeconds ? `${h}:${m}:${s}` : `${h}:${m}`}`;
}

/** 取 `"YYYY-MM-DD HH:mm[:ss]"` 的日期段，供 Calendar 的 minDate/maxDate 用。 */
export function boundDate(bound: string | undefined): string | undefined {
  return bound ? splitDateTime(bound).date ?? undefined : undefined;
}

/**
 * 把边界补齐到与当前值同形状再钳制。**不补形状就会错**：`"2026-06-08 09:30:00" > "2026-06-08 09:30"`
 * 在字符串比较下成立（前缀相同则长者为大），钳制会把值改成一个连形状都不对的串。
 */
export function clampDateTime(value: string, withSeconds: boolean, min?: string, max?: string): string {
  const norm = (b?: string) => {
    if (!b) return undefined;
    const p = splitDateTime(b);
    return joinDateTime(p.date, p.time, withSeconds) ?? undefined;
  };
  const lo = norm(min);
  const hi = norm(max);
  if (lo && value < lo) return lo;
  if (hi && value > hi) return hi;
  return value;
}

export interface TimeBounds {
  minTime?: string;
  maxTime?: string;
}

/**
 * 推导「选中这一天时，时间列的可选范围」。
 *
 * 这是本组件唯一不平凡的一段：min/max 是**日期时间**整体的边界，但时间列只认时间。
 * 只有当选中日恰好压在边界那天时，时间才受限；落在区间内部的日子，一天 24 小时全开。
 * 少了这一步就会出现「9 月 1 日 09:30 起可选，结果 9 月 2 日的 00:00 也被禁掉」。
 */
export function effectiveTimeBounds(
  date: string | null,
  minDateTime?: string,
  maxDateTime?: string,
): TimeBounds {
  if (!date) return {};
  const out: TimeBounds = {};
  const lo = minDateTime ? splitDateTime(minDateTime) : null;
  const hi = maxDateTime ? splitDateTime(maxDateTime) : null;
  if (lo?.date === date && lo.time) out.minTime = lo.time;
  if (hi?.date === date && hi.time) out.maxTime = hi.time;
  return out;
}
