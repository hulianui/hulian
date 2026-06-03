"use client";
import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zhCN } from "@mui/x-date-pickers/locales";
import "dayjs/locale/zh-cn"; // 副作用：注册 dayjs 中文 locale（月份名/星期头本地化）
import { hulianMuiTheme } from "./theme";

// MUI X 内置中文文案（取消/确认按钮、视图导航、屏幕阅读器标签等）。
const zhLocaleText = zhCN.components.MuiLocalizationProvider.defaultProps.localeText;

// 瑚琏 MUI 桥 Provider：桥主题 + 日期本地化（dayjs 适配器）下发给子树所有 MUI 件。
// 挂在 www layout（AppRouterCacheProvider 内）；日期族（Calendar/DatePicker/DateTimePicker/TimeField）依赖此 LocalizationProvider。
// 项目无 i18n 框架，首批面向中文用户 → 此处把 MUI X 默认英文（February / CANCEL / OK）统一切中文：
//   adapterLocale="zh-cn" 管日历内容（月份/星期），localeText 管控件文案/按钮。
export function MuiBridgeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={hulianMuiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn" localeText={zhLocaleText}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
