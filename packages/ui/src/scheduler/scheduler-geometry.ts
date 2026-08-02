import { dayjs } from "../lib/date";
import type { EventLayout, SchedulerColumn, SchedulerResource } from "./scheduler.types";

// Scheduler 几何 —— 纯函数（无 DOM/React），便于单测。
// 时间轴按「当日本地时」做分钟映射：诊所同时区，事件 start/end 用本地时分解释，
// 避开 UTC 跨日界漂移（与 Gantt 仅日期用 UTC 是不同场景）。日期数学全走库内 dayjs（SSoT）。

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** ISO datetime → 距当日 0 点的分钟数（本地时分）。 */
export function minutesOfDay(iso: string): number {
  const d = dayjs(iso);
  return d.hour() * 60 + d.minute();
}

/** 吸附到 step 分钟网格（四舍五入到最近格）。 */
export function snap(minutes: number, step: number): number {
  if (step <= 0) return minutes;
  return Math.round(minutes / step) * step;
}

/** ISO datetime → 日期段 "YYYY-MM-DD"。 */
export function dateOf(iso: string): string {
  return dayjs(iso).format("YYYY-MM-DD");
}

/** 日期段 + 当日分钟数 → 本地 ISO datetime（无时区后缀，保 hour() 稳定）。 */
export function minutesToISO(dateISO: string, minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return dayjs(dateISO).hour(h).minute(mm).second(0).millisecond(0).format("YYYY-MM-DDTHH:mm:ss");
}

/** 事件在时间轴上的 top/height（px）。pxPerMin = hourHeight/60。 */
export function eventRect(
  startMin: number,
  endMin: number,
  dayStartMin: number,
  pxPerMin: number,
): { top: number; height: number } {
  const top = (startMin - dayStartMin) * pxPerMin;
  const height = Math.max((endMin - startMin) * pxPerMin, 1);
  return { top, height };
}

/** 时间轴落点 y(px) → 当日分钟数（已 clamp 到 [dayStartMin, dayEndMin]）。 */
export function yToMinutes(
  offsetY: number,
  dayStartMin: number,
  dayEndMin: number,
  pxPerMin: number,
): number {
  const raw = dayStartMin + offsetY / pxPerMin;
  return clamp(raw, dayStartMin, dayEndMin);
}

/**
 * 同一列内重叠事件并排分列。贪心扫描线：按 start 排序，分到首个不冲突的列；
 * 连通簇内 cols = 簇并发列数（同簇所有事件共享 cols，视觉等宽）。
 * 入参为同一列（同一天/同一资源）的事件；返回 id → {col, cols}。
 */
export function layoutColumns(
  events: { id: string; start: string; end: string }[],
): Map<string, EventLayout> {
  const items = events
    .map((e) => ({ id: e.id, s: minutesOfDay(e.start), e: minutesOfDay(e.end), col: 0 }))
    .sort((a, b) => a.s - b.s || a.e - b.e);

  const result = new Map<string, EventLayout>();
  let cluster: typeof items = [];
  let clusterEnd = -Infinity;
  const colsEnd: number[] = []; // 每列在当前簇里的最后结束分钟

  const flush = () => {
    const n = colsEnd.length;
    for (const it of cluster) result.set(it.id, { col: it.col, cols: n });
    cluster = [];
    colsEnd.length = 0;
    clusterEnd = -Infinity;
  };

  for (const it of items) {
    if (cluster.length && it.s >= clusterEnd) flush();
    // 找首个空闲列（该列上一事件已结束 <= 本事件开始）
    let col = colsEnd.findIndex((end) => end <= it.s);
    if (col === -1) {
      col = colsEnd.length;
      colsEnd.push(it.e);
    } else {
      colsEnd[col] = it.e;
    }
    it.col = col;
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.e);
  }
  if (cluster.length) flush();
  return result;
}

/** focal 所在 ISO 周（周一起）的周一日期段。 */
export function startOfWeekISO(focalISO: string): string {
  const d = dayjs(focalISO);
  const back = (d.day() + 6) % 7; // 0=Sun..6=Sat → 周一偏移
  return d.subtract(back, "day").format("YYYY-MM-DD");
}

export interface SchedulerDateLabels {
  weekdays: readonly string[];
  weekDate: (month: number, day: number) => string;
  dayColumn: (month: number, day: number) => string;
}

const DEFAULT_DATE_LABELS: SchedulerDateLabels = {
  weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  weekDate: (month, day) => `${month}/${day}`,
  dayColumn: (month, day) => `${month}月${day}日`,
};

/** 月视图 6×7 矩阵（ISO 周一起，含上/下月补位）。返回每格 "YYYY-MM-DD"。 */
export function monthMatrix(focalISO: string): string[][] {
  const first = dayjs(focalISO).date(1);
  const back = (first.day() + 6) % 7;
  const gridStart = first.subtract(back, "day");
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(gridStart.add(w * 7 + d, "day").format("YYYY-MM-DD"));
    }
    weeks.push(row);
  }
  return weeks;
}

/** 周视图 7 列。todayISO 用于高亮（默认不高亮）。 */
export function weekColumns(
  focalISO: string,
  todayISO?: string,
  labels: SchedulerDateLabels = DEFAULT_DATE_LABELS,
): SchedulerColumn[] {
  const monday = dayjs(startOfWeekISO(focalISO));
  return Array.from({ length: 7 }, (_, i) => {
    const d = monday.add(i, "day");
    const dateISO = d.format("YYYY-MM-DD");
    return {
      key: dateISO,
      dateISO,
      label: labels.weekdays[i] ?? "",
      sublabel: labels.weekDate(d.month() + 1, d.date()),
      isToday: dateISO === todayISO,
    };
  });
}

/** 日视图单列。 */
export function dayColumns(
  focalISO: string,
  todayISO?: string,
  labels: SchedulerDateLabels = DEFAULT_DATE_LABELS,
): SchedulerColumn[] {
  const d = dayjs(focalISO);
  const dateISO = d.format("YYYY-MM-DD");
  return [
    {
      key: dateISO,
      dateISO,
      label: labels.dayColumn(d.month() + 1, d.date()),
      sublabel: labels.weekdays[(d.day() + 6) % 7],
      isToday: dateISO === todayISO,
    },
  ];
}

/** 资源视图：每资源一列，均绑焦点日。 */
export function resourceColumns(
  focalISO: string,
  resources: SchedulerResource[],
): SchedulerColumn[] {
  const dateISO = dayjs(focalISO).format("YYYY-MM-DD");
  return resources.map((r) => ({
    key: r.id,
    dateISO,
    label: r.title,
    sublabel: r.subtitle,
    resourceId: r.id,
  }));
}

/** 整点横线的小时数组 [start, start+1, ..., end]。 */
export function hourLines(dayStartHour: number, dayEndHour: number): number[] {
  const out: number[] = [];
  for (let h = dayStartHour; h <= dayEndHour; h++) out.push(h);
  return out;
}
