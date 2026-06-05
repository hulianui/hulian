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
