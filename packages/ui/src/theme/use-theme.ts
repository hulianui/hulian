"use client";
import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
export type ThemeSetting = Theme | "system";

export interface ThemeContextValue {
  theme: Theme; // 解析后的实际主题
  setting: ThemeSetting; // 用户选择（含 system）
  setTheme: (s: ThemeSetting) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
