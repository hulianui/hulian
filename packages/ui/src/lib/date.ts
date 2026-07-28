import dayjs, { type Dayjs } from "dayjs";

// 全库日期/时间的单一出口。组件一律从这里取 dayjs / 格式常量 / 转换工具，
// 不直接 import "dayjs"——这样将来换 date 引擎（如 MUI X 改用 AdapterDateFns）
// 只需改本文件，散落在 _mui/* 与 date-range-picker 的转换逻辑不必逐处翻找。
//
// 注意：中文 locale（月份/星期本地化）的副作用注册由 _mui/provider.tsx 持有，
// 因为只有 MUI X 桥子树需要它；此处不引 locale，避免拖累所有日期工具消费者的 bundle。
export { dayjs };
export type { Dayjs };

// 日期/时间格式常量（dayjs format 串）——统一来源，杜绝魔法字符串各处各写。
export const DATE_FORMAT = "YYYY-MM-DD"; // ISO 日期
export const TIME_FORMAT = "HH:mm"; // 时:分
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm"; // 日期 + 时:分
export const DATE_TIME_SEC_FORMAT = "YYYY-MM-DD HH:mm:ss"; // 日期 + 时:分:秒

// ISO 字符串 → Dayjs（内部用，不向消费者泄漏 dayjs 类型）。
// 空值穿透为 null，契合 MUI X 受控件 value === null 的"清空"语义。
export const toDayjs = (s?: string | null): Dayjs | null => (s ? dayjs(s) : null);

// Dayjs → ISO 日期串（YYYY-MM-DD）。
// 定宽 → 字典序即时间序，区间判定可直接字符串比较，避开时区/UTC 偏移日界坑。
export const toISODate = (d: Dayjs): string => d.format(DATE_FORMAT);

// 任意可解析日期入参 → 规范化 ISO 日期串；空值穿透为 undefined。
export const normISODate = (s?: string): string | undefined => (s ? toISODate(dayjs(s)) : undefined);

// 月/年格式（月选择器 / 年选择器的对外值形状）。
export const MONTH_FORMAT = "YYYY-MM";
export const YEAR_FORMAT = "YYYY";

/** 日历表头的星期名（周日起）。自研日历件共用，避免各写一份中文星期。 */
export const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

/**
 * 月历格子：6 周 × 7 列 = 42 格，含本月前后补位。
 * 恒定 42 格（而非按需 35/42）是为了月份切换时面板高度不跳。
 */
export function monthMatrix(month: Dayjs): Dayjs[] {
  const first = month.startOf("month");
  const gridStart = first.subtract(first.day(), "day"); // 回退到本周日
  return Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));
}

/**
 * 年份面板的 12 格：以 `year` 所在的**十年段**为主体，前后各补一格凑满 3×4 网格。
 * 如 2026 → 2019, [2020..2029], 2030；首尾两格是邻段的补位，渲染时弱化。
 * 按十年段（而非十二年段）分是因为人对「20 年代」有直觉，2016–2027 这种切法读起来没有着落。
 */
export function yearMatrix(year: number): number[] {
  const decadeStart = Math.floor(year / 10) * 10;
  return Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);
}
