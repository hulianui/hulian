// TimePicker 的时间算术纯函数。零依赖、可在 RSC 中安全调用，单独成文件是为了能脱离 DOM 单测。
//
// 内部一律把时刻规范成定宽 "HH:mm:ss"：定宽 → 字典序即时间序，min/max 的比较可以直接比字符串，
// 不必转成分钟数再转回来（那条路上最容易在 60 进位与补零上出错）。

export interface TimeParts {
  h: number;
  m: number;
  s: number;
}

export const pad2 = (n: number): string => String(n).padStart(2, "0");

/** "HH:mm" / "HH:mm:ss" → 时分秒；不合法（含越界数字）返回 null。 */
export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value.trim());
  if (!m) return null;
  const parts = { h: Number(m[1]), m: Number(m[2]), s: m[3] ? Number(m[3]) : 0 };
  if (parts.h > 23 || parts.m > 59 || parts.s > 59) return null;
  return parts;
}

/** 时分秒 → 对外值。`withSeconds=false` 时截到分钟。 */
export function formatTime(t: TimeParts, withSeconds: boolean): string {
  return withSeconds
    ? `${pad2(t.h)}:${pad2(t.m)}:${pad2(t.s)}`
    : `${pad2(t.h)}:${pad2(t.m)}`;
}

/** 任意形状的时刻串 → 定宽 "HH:mm:ss"，供比较用。不合法返回 null。 */
export function toCompare(value: string | null | undefined): string | null {
  const t = parseTime(value);
  return t ? `${pad2(t.h)}:${pad2(t.m)}:${pad2(t.s)}` : null;
}

/** 按步进生成 0..max 的候选值（step<1 或非整数时退化为 1）。 */
export function buildOptions(max: number, step = 1): number[] {
  const s = Number.isInteger(step) && step >= 1 ? step : 1;
  const out: number[] = [];
  for (let v = 0; v <= max; v += s) out.push(v);
  return out;
}

/**
 * 某个「时刻区间」是否与 [min,max] 有交集。三列的禁用判定都归到这一条：
 * - 小时 h → [h:00:00, h:59:59]
 * - 分钟 (h,m) → [h:m:00, h:m:59]
 * - 秒 (h,m,s) → [h:m:s, h:m:s]
 *
 * 判「整段是否全部落在范围外」而不是「端点是否越界」——否则 min=08:30 时整个 8 点会被误禁，
 * 而 8:30~8:59 明明可选。
 */
export function intersectsRange(
  from: string,
  to: string,
  min?: string | null,
  max?: string | null,
): boolean {
  const lo = toCompare(min);
  const hi = toCompare(max);
  if (lo && to < lo) return false;
  if (hi && from > hi) return false;
  return true;
}

export function isHourDisabled(h: number, min?: string | null, max?: string | null): boolean {
  return !intersectsRange(`${pad2(h)}:00:00`, `${pad2(h)}:59:59`, min, max);
}

export function isMinuteDisabled(
  h: number,
  m: number,
  min?: string | null,
  max?: string | null,
): boolean {
  return !intersectsRange(`${pad2(h)}:${pad2(m)}:00`, `${pad2(h)}:${pad2(m)}:59`, min, max);
}

export function isSecondDisabled(
  h: number,
  m: number,
  s: number,
  min?: string | null,
  max?: string | null,
): boolean {
  const at = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return !intersectsRange(at, at, min, max);
}

/**
 * 把时刻按各列步进**向下**取整对齐到候选值上。
 * 「此刻」快捷与外部传进来的非对齐值都要过这一道，否则面板里没有对应的高亮项，
 * 看上去像是「有值但一个都没选中」。
 */
export function snapToStep(t: TimeParts, minuteStep = 1, secondStep = 1): TimeParts {
  const ms = Number.isInteger(minuteStep) && minuteStep >= 1 ? minuteStep : 1;
  const ss = Number.isInteger(secondStep) && secondStep >= 1 ? secondStep : 1;
  return {
    h: t.h,
    m: Math.floor(t.m / ms) * ms,
    s: Math.floor(t.s / ss) * ss,
  };
}

/** 夹紧到 [min,max]（都按定宽串比较）。范围本身非法时原样返回。 */
export function clampTime(
  t: TimeParts,
  withSeconds: boolean,
  min?: string | null,
  max?: string | null,
): TimeParts {
  const cur = `${pad2(t.h)}:${pad2(t.m)}:${pad2(t.s)}`;
  const lo = toCompare(min);
  const hi = toCompare(max);
  if (lo && cur < lo) return parseTime(lo) ?? t;
  if (hi && cur > hi) {
    const clamped = parseTime(hi) ?? t;
    // 不带秒时 max 的秒位不参与对外值，直接截掉即可
    return withSeconds ? clamped : { ...clamped, s: 0 };
  }
  return t;
}
