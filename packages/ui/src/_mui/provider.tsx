"use client";
import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { hulianMuiTheme } from "./theme";

// 瑚琏 MUI 桥 Provider：桥主题 + 日期本地化（dayjs 适配器）下发给子树所有 MUI 件。
// 挂在 www layout（AppRouterCacheProvider 内）；日期族（Calendar/DatePicker/TimeField）依赖此 LocalizationProvider。
export function MuiBridgeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={hulianMuiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
    </ThemeProvider>
  );
}
