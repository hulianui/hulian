// 子路径入口：`import { cn } from "@hulianui/ui/lib"`。
// 只放根 barrel 已对外的那几个 —— 本目录其余文件（drag-guard / is-dev / warn-once /
// tone / use-gl-canvas）是组件内部实现，不因为多了个子路径就变成公共 API（hulianui/hulian#19）。
export { cn } from "./cn";
// 日期 SSoT（消费者需 dayjs 做日期数学时从这里取，避免各自装一份/版本漂移）
export { dayjs, DATE_FORMAT, TIME_FORMAT, DATE_TIME_FORMAT } from "./date";
export type { Dayjs } from "./date";
