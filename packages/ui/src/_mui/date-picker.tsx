"use client";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { toDayjs } from "../lib/date";
import type { DatePickerProps } from "./date-picker.types";

// 瑚琏 DatePicker = MUI DatePicker 罩瑚琏受控 API（对外 ISO 字符串）+ token 皮肤。
// 弹出的日历继承 hulianMuiTheme palette（含 theme.alpha 集中重写规避 var() 抛错，见 theme.ts），
// 这里只补输入框 textField 的圆角/边框/文字色。挂在 MuiBridgeProvider 下即得已打补丁主题。
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  disabled,
  readOnly,
  label,
  className,
}: DatePickerProps) {
  return (
    <MuiDatePicker
      className={className}
      label={label}
      value={value === undefined ? undefined : toDayjs(value)}
      defaultValue={toDayjs(defaultValue) ?? undefined}
      minDate={toDayjs(minDate) ?? undefined}
      maxDate={toDayjs(maxDate) ?? undefined}
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
