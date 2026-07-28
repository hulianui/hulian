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

/** localStorage 键名。ThemeProvider 与库内的无 Provider 降级路径共用，保证两边写同一个位置。 */
export const THEME_STORAGE_KEY = "hulian-theme";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/**
 * 不抛的版本：缺 Provider 时返回 null。
 * 库内组件一律用它 —— 组件件在缺上下文时应降级，直接 throw 会把「少挂一个 Provider」
 * 升级成整页白屏，而错误栈指向组件内部、消费方难以归因。应用代码想要强约束仍用 useTheme。
 */
export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
