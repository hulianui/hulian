"use client";
import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DATE_TIME_FORMAT, DATE_TIME_SEC_FORMAT, toDayjs } from "../lib/date";
import type { DateTimePickerProps } from "./date-time-picker.types";

// 瑚琏 DateTimePicker = MUI DateTimePicker 罩瑚琏受控 API（对外 ISO 字符串）+ token 皮肤。
// 「年月日 + 时间」一体弹层（日历 + 时钟列），继承 hulianMuiTheme palette（见 theme.ts）。
// 与 DatePicker 同源，仅多出时间段编辑与 24h 时钟；这里补输入框 textField 的圆角/边框/文字色。
export function DateTimePicker({
  value,
  defaultValue,
  onValueChange,
  minDateTime,
  maxDateTime,
  minutesStep,
  withSeconds = false,
  disabled,
  readOnly,
  label,
  className,
}: DateTimePickerProps) {
  return (
    <MuiDateTimePicker
      className={className}
      label={label}
      // 24 小时制；按需带秒（YYYY-MM-DD HH:mm[:ss]）
      format={withSeconds ? DATE_TIME_SEC_FORMAT : DATE_TIME_FORMAT}
      ampm={false}
      views={withSeconds ? ["year", "month", "day", "hours", "minutes", "seconds"] : ["year", "month", "day", "hours", "minutes"]}
      minutesStep={minutesStep}
      value={value === undefined ? undefined : toDayjs(value)}
      defaultValue={toDayjs(defaultValue) ?? undefined}
      minDateTime={toDayjs(minDateTime) ?? undefined}
      maxDateTime={toDayjs(maxDateTime) ?? undefined}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(v) => onValueChange?.(v ? v.toISOString() : null)}
      slotProps={{
        textField: {
          size: "small",
          sx: {
            "& .MuiOutlinedInput-root": { borderRadius: "var(--radius)" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
            "& .MuiInputBase-input": { color: "var(--color-foreground)" },
            "& .MuiInputLabel-root": { color: "var(--color-muted)" },
          },
        },
      }}
    />
  );
}
