"use client";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { DatePickerProps } from "./date-picker.types";

// ISO 字符串 → dayjs（内部用，不向消费者泄漏 dayjs）
const toDJ = (s?: string | null) => (s ? dayjs(s) : null);

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
      value={value === undefined ? undefined : toDJ(value)}
      defaultValue={toDJ(defaultValue) ?? undefined}
      minDate={toDJ(minDate) ?? undefined}
      maxDate={toDJ(maxDate) ?? undefined}
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
