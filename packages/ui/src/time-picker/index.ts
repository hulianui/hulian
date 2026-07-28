export { TimePicker } from "./time-picker";
export type { TimePickerProps } from "./time-picker.types";
// 时刻算术纯函数，供消费方在表单校验里复用（不必再解析一遍时间串）。
// formatTime 在库内已被 Video 占用（那份是「秒数 → mm:ss」），故对外改名 formatTimeParts，
// 免得根 barrel 上两个同名导出打架。
export {
  buildOptions,
  clampTime,
  formatTime as formatTimeParts,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
  parseTime,
  snapToStep,
  type TimeParts,
} from "./time-picker-core";
