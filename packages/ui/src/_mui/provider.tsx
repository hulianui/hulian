"use client";
import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { hulianMuiTheme } from "./theme";

// 瑚琏 MUI 桥 Provider：把桥主题下发给子树所有 MUI 件。挂在 www layout（AppRouterCacheProvider 内）。
export function MuiBridgeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={hulianMuiTheme}>{children}</ThemeProvider>;
}
