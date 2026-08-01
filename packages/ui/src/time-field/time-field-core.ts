// 分段时间输入的纯逻辑。键盘录入的边界情况全在这里，组件只负责把事件转成对这些函数的调用 ——
// 「按 2 再按 9 应该变成几点」这种问题必须能单测，塞进 onKeyDown 里就没人验得了。

export type TimeSegment = "hour" | "minute" | "second";

export interface TimeParts {
  hour: number | null;
  minute: number | null;
  second: number | null;
}

export const SEGMENT_ORDER: readonly TimeSegment[] = ["hour", "minute", "second"];

export const SEGMENT_MAX: Record<TimeSegment, number> = { hour: 23, minute: 59, second: 59 };

export const SEGMENT_LABEL: Record<TimeSegment, string> = { hour: "小时", minute: "分钟", second: "秒" };

export const EMPTY_PARTS: TimeParts = { hour: null, minute: null, second: null };

const pad = (n: number) => String(n).padStart(2, "0");

/** `"HH:mm"` / `"HH:mm:ss"` → 分段值。解析不出来的段留 null（照样能显示成 `--`）。 */
export function parseTime(v: string | null | undefined): TimeParts {
  if (!v) return { ...EMPTY_PARTS };
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(v.trim());
  if (!m) return { ...EMPTY_PARTS };
  const pick = (s: string | undefined, seg: TimeSegment) => {
    if (s == null) return null;
    const n = Number(s);
    return Number.isInteger(n) && n >= 0 && n <= SEGMENT_MAX[seg] ? n : null;
  };
  return { hour: pick(m[1], "hour"), minute: pick(m[2], "minute"), second: pick(m[3], "second") };
}

/**
 * 分段值 → 对外字符串。**缺任何一段就返回 null** —— 半截时间不该流到业务里，
 * 调用方据此判断「还没输完」。
 */
export function formatTime(parts: TimeParts, withSeconds: boolean): string | null {
  if (parts.hour == null || parts.minute == null) return null;
  if (withSeconds && parts.second == null) return null;
  const base = `${pad(parts.hour)}:${pad(parts.minute)}`;
  return withSeconds ? `${base}:${pad(parts.second ?? 0)}` : base;
}

/** ↑↓ 调值：段内循环（23 再往上回到 0）。空段起步 —— ↑ 从最小、↓ 从最大，符合直觉。 */
export function stepSegment(current: number | null, seg: TimeSegment, dir: 1 | -1): number {
  const max = SEGMENT_MAX[seg];
  if (current == null) return dir === 1 ? 0 : max;
  const size = max + 1;
  return (((current + dir) % size) + size) % size;
}

export interface DigitResult {
  /** 该段的新值 */
  value: number;
  /** 还在等第二位时保留已输入的那位；已定形则为空串 */
  buffer: string;
  /** 该段是否已经输完（组件据此自动跳下一段） */
  complete: boolean;
}

/**
 * 数字键录入，两位缓冲。
 *
 * 关键的一条是「第二位放不下时不钳制、改当新首位」：小时段里先按 `2` 再按 `9`，
 * 29 点不存在 —— 钳成 23 点是凭空造了个用户没按过的值，而把 `9` 当成新的一次输入
 * （得到 09 点）才是他真正想要的。分钟/秒同理。
 */
export function typeDigit(buffer: string, digit: string, seg: TimeSegment): DigitResult {
  const max = SEGMENT_MAX[seg];
  const d = Number(digit);
  if (!Number.isInteger(d) || d < 0 || d > 9) return { value: 0, buffer: "", complete: false };

  if (buffer !== "") {
    const combined = Number(buffer + digit);
    if (combined <= max) return { value: combined, buffer: "", complete: true };
    // 放不下 → 退回按首位处理（递归一层，buffer 已清空不会再次进这个分支）
    return typeDigit("", digit, seg);
  }

  // 首位：一旦补零后仍超范围（如小时按 3 → 30 点不存在），这一位就已经定形了
  if (d * 10 > max) return { value: d, buffer: "", complete: true };
  return { value: d, buffer: digit, complete: false };
}

/**
 * 把 min/max 补齐到与当前值同形状。**不补就会错**：`"18:00:30" > "18:00"` 在字符串比较下成立
 * （前缀相同则长者为大），于是钳制会把值改成 `"18:00"` —— 一个在 withSeconds 下形状都不对的值。
 * 边界的秒缺省按 `:00` 补，即「最晚 18:00」= 18:00:00 整。
 */
export function normalizeBound(bound: string | undefined, withSeconds: boolean): string | undefined {
  if (!bound) return undefined;
  const p = parseTime(bound);
  if (p.hour == null || p.minute == null) return undefined;
  return formatTime({ ...p, second: p.second ?? 0 }, withSeconds) ?? undefined;
}

/**
 * 把完整时刻钳进 [min, max]。定宽字符串比较即时间序，不用转 Date。
 * 只在**整段输完**后做一次 —— 段级钳制会让「先输 23 点再输分钟」这类顺序根本没法输
 * （min=09:30 时刚输完 hour=23 的瞬间还没有 minute，段级判定会当场把它拽回 09）。
 */
export function clampTime(value: string, withSeconds: boolean, min?: string, max?: string): string {
  const lo = normalizeBound(min, withSeconds);
  const hi = normalizeBound(max, withSeconds);
  if (lo && value < lo) return lo;
  if (hi && value > hi) return hi;
  return value;
}

/** 展示用：null 段渲染成 `--`。 */
export function segmentText(parts: TimeParts, seg: TimeSegment): string {
  const v = parts[seg];
  return v == null ? "--" : pad(v);
}
