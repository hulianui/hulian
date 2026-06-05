"use client";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import type { CalendarProps } from "./calendar.types";

// ISO 字符串 → dayjs（内部用，不向消费者泄漏 dayjs）
const toDJ = (s?: string | null) => (s ? dayjs(s) : null);

// 瑚琏 Calendar = MUI DateCalendar 罩瑚琏受控 API（对外 ISO 字符串）+ token 皮肤。
// 大部分配色由 hulianMuiTheme palette 继承（含 theme.alpha 集中重写规避 var() 抛错，见 theme.ts），
// 这里只补 palette 兜不住的选区/今日/标签/箭头细节。挂在 MuiBridgeProvider 下即得已打补丁主题。
export function Calendar({
  value,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  disabled,
  readOnly,
  className,
}: CalendarProps) {
  return (
    <DateCalendar
      className={className}
      // 受控：value === undefined 时不传（走非受控），否则转 dayjs
      value={value === undefined ? undefined : toDJ(value)}
      defaultValue={toDJ(defaultValue) ?? undefined}
      minDate={toDJ(minDate) ?? undefined}
      maxDate={toDJ(maxDate) ?? undefined}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(v) => onValueChange?.(v ? v.toISOString() : null)}
      sx={{
        // 自适应容器：默认 MUI DateCalendar 固定 320px，塞进窄容器（侧栏等）会溢出、
        // 裁掉头部「下个月」箭头。改为占满容器（上限 320 保持宽容器下不被拉散），
        // 日格行均分铺满 → 任意宽度都不裁箭头、不溢出。
        width: "100%",
        maxWidth: 320,
        "& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer": {
          justifyContent: "space-between",
        },
        // 选中日：瑚琏主色 + 前景
        "& .MuiPickersDay-root.Mui-selected": {
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        },
        "& .MuiPickersDay-root.Mui-selected:hover": {
          backgroundColor: "var(--color-primary-hover)",
        },
        // 普通日 hover
        "& .MuiPickersDay-root:hover": {
          backgroundColor: "var(--color-surface-hover)",
        },
        // 今日描边
        "& .MuiPickersDay-today:not(.Mui-selected)": {
          borderColor: "var(--color-primary)",
        },
        // 星期标签
        "& .MuiDayCalendar-weekDayLabel": {
          color: "var(--color-muted)",
        },
        // 头部月份/年份 label + 切换箭头
        "& .MuiPickersCalendarHeader-label": {
          color: "var(--color-foreground)",
        },
        "& .MuiPickersArrowSwitcher-button, & .MuiPickersCalendarHeader-switchViewButton": {
          color: "var(--color-foreground)",
        },
      }}
    />
  );
}
