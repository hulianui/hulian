import { dayjs } from "../lib/date";

// 贡献墙的日期几何 —— 把「一串带日期的计数」摊成「按周分列的 7 行网格」。
//
// 为什么不用 Heatmap 硬凑：Heatmap 是通用矩阵（行列标签由数据推导），画贡献墙就得在调用方
// 手写「日期 → 第几周第几行」的换算、补齐缺席日、算月份标签落在哪一列——这套日期语义每个
// 消费方都要重写一遍。抽到这里后组件只负责画，日期算术可单测。
//
// 日期一律按本地日历日（dayjs startOf("day")）对齐，键用 ISO `YYYY-MM-DD`。

export interface ContributionDay {
  /** ISO 字符串 / Date 均可；同一天多条会累加。 */
  date: string | Date;
  /** 该日计数，缺省按 1 计（便于直接喂一串「事件发生日」）。 */
  count?: number;
}

export interface ContributionCell {
  /** ISO `YYYY-MM-DD`。 */
  date: string;
  count: number;
  /** 该日是否在 `data` 里出现过（区分「无上报」与「上报了 0」）。 */
  present: boolean;
  /** 0=周日 … 6=周六。 */
  weekday: number;
}

export interface ContributionMonthLabel {
  /** 落在第几列（周）。 */
  weekIndex: number;
  /** 该列首日的 ISO 日期，由组件决定怎么格式化月名。 */
  date: string;
}

export interface ContributionCalendar {
  /** 区间内每一天，时间正序。 */
  days: ContributionCell[];
  /** 每列一周（7 格）；首周不足处补 `null`。 */
  weeks: (ContributionCell | null)[][];
  monthLabels: ContributionMonthLabel[];
  /** 区间内总计数。 */
  total: number;
  /** 区间内单日最大计数（全 0 时为 0）。 */
  max: number;
}

export interface ContributionCalendarOptions {
  /** 区间天数（含结束日）。@default 365 */
  days: number;
  /** 结束日（含），默认今天。 */
  endDate: string | Date;
  /** 周起始：0=周日（GitHub 口径）/ 1=周一。@default 0 */
  weekStart: 0 | 1;
}

/** 把 data 聚合成 ISO 日期 → 计数。同日多条累加，count 缺省按 1 计。 */
function aggregate(data: ContributionDay[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of data) {
    const dj = dayjs(d.date);
    if (!dj.isValid()) continue; // 脏日期直接跳过，不让 "Invalid Date" 混进键里
    const key = dj.format("YYYY-MM-DD");
    map.set(key, (map.get(key) ?? 0) + (d.count ?? 1));
  }
  return map;
}

export function buildContributionCalendar(
  data: ContributionDay[],
  options: Partial<ContributionCalendarOptions> = {},
): ContributionCalendar {
  const { days = 365, endDate, weekStart = 0 } = options;
  const span = Math.max(1, Math.floor(days));
  const end = dayjs(endDate ?? undefined).startOf("day");
  const start = end.subtract(span - 1, "day");
  const counts = aggregate(data);

  const cells: ContributionCell[] = [];
  for (let i = 0; i < span; i++) {
    const d = start.add(i, "day");
    const date = d.format("YYYY-MM-DD");
    const raw = counts.get(date);
    cells.push({ date, count: raw ?? 0, present: raw !== undefined, weekday: d.day() });
  }

  // 首周补空：让第一列的行位对齐真实星期，而不是从第 0 行硬起。
  const lead = (cells[0].weekday - weekStart + 7) % 7;
  const slots: (ContributionCell | null)[] = [...Array(lead).fill(null), ...cells];
  const weeks: (ContributionCell | null)[][] = [];
  for (let i = 0; i < slots.length; i += 7) {
    const week = slots.slice(i, i + 7);
    while (week.length < 7) week.push(null); // 末周补齐，保证每列都是 7 格
    weeks.push(week);
  }

  // 月份标签：某一列里出现了新的月份就在该列打标（跳过只剩零星几天的首列，免得和次列挤在一起）。
  const monthLabels: ContributionMonthLabel[] = [];
  let lastMonth = "";
  weeks.forEach((week, weekIndex) => {
    const first = week.find((c): c is ContributionCell => c !== null);
    if (!first) return;
    const month = first.date.slice(0, 7);
    if (month === lastMonth) return;
    lastMonth = month;
    // 首列若只剩不足 4 天，它的月标会紧贴次列的月标，丢掉更整洁。
    if (weekIndex === 0 && week.filter(Boolean).length < 4) return;
    monthLabels.push({ weekIndex, date: first.date });
  });

  let total = 0;
  let max = 0;
  for (const c of cells) {
    total += c.count;
    if (c.count > max) max = c.count;
  }

  return { days: cells, weeks, monthLabels, total, max };
}
