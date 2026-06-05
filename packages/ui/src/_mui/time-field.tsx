"use client";
import { TimeField as MuiTimeField } from "@mui/x-date-pickers/TimeField";
import { TIME_FORMAT, toDayjs } from "../lib/date";
import type { TimeFieldProps } from "./time-field.types";

// 瑚琏 TimeField = MUI TimeField 罩瑚琏受控 API（对外 ISO 字符串）+ token 皮肤。
// 24 小时制（HH:mm）；无 popover，sx 直接落在输入框上。
export function TimeField({
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly,
  label,
  className,
}: TimeFieldProps) {
  return (
    <MuiTimeField
      className={className}
      label={label}
      format={TIME_FORMAT}
      size="small"
      value={value === undefined ? undefined : toDayjs(value)}
      defaultValue={toDayjs(defaultValue) ?? undefined}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(v) => onValueChange?.(v ? v.toISOString() : null)}
      sx={{
        "& .MuiOutlinedInput-root": { borderRadius: "var(--radius)" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
        "& .MuiInputBase-input": { color: "var(--color-foreground)" },
        "& .MuiInputLabel-root": { color: "var(--color-muted)" },
      }}
    />
  );
}
