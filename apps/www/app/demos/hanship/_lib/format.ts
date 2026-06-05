// 瀚舰 demo 纯格式化助手。

/** 构建耗时：71 → "1m 11s"，9 → "9s"，null → "—"。 */
export function formatDuration(sec: number | null): string {
  if (sec == null) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

/** 日志相对秒 → "mm:ss"。 */
export function mmss(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 「N 分钟前」偏移 → 真实 Date（渲染时实时换算，保证 RelativeTime 永远新鲜）。 */
export function agoDate(min: number): Date {
  return new Date(Date.now() - min * 60_000);
}

/** 「N 天前」偏移 → 真实 Date。 */
export function agoDateDays(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}
