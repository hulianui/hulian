"use client";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme, type ThemeSetting } from "./use-theme";

const STORAGE_KEY = "hulian-theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(setting: ThemeSetting): Theme {
  return setting === "system" ? systemTheme() : setting;
}

export function ThemeProvider({
  children,
  defaultSetting = "system",
  forcedTheme,
}: {
  children: ReactNode;
  defaultSetting?: ThemeSetting;
  /** 强制主题（如按路由定主题）：覆盖用户偏好与系统监听；期间 setTheme/toggle 写入偏好但不改视觉 */
  forcedTheme?: Theme;
}) {
  const [setting, setSettingState] = useState<ThemeSetting>(defaultSetting);
  // 初始 theme 必须确定性：SSR(无 window) 与客户端首渲必须一致，否则主题相关渲染(如 toggler 图标)
  // 会 hydration mismatch(React #418)。首渲不调 systemTheme()，统一取确定值(system→light)；真实主题由
  // 下方 mount effect 立即校正（视觉主题本就由 anti-FOUC 脚本设的 data-theme + CSS 驱动，不依赖此 JS 值）。
  const [theme, setThemeState] = useState<Theme>(
    forcedTheme ?? (defaultSetting === "system" ? "light" : defaultSetting),
  );

  // hydrate from storage once on mount
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeSetting | null;
    const s = stored ?? defaultSetting;
    setSettingState(s);
    setThemeState(resolve(s));
  }, [defaultSetting]);

  // reflect to <html data-theme> + react to system changes when setting=system
  useEffect(() => {
    if (forcedTheme) {
      setThemeState(forcedTheme);
      document.documentElement.setAttribute("data-theme", forcedTheme);
      return;
    }
    const t = resolve(setting);
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    if (setting !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next: Theme = mq.matches ? "dark" : "light";
      setThemeState(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setting, forcedTheme]);

  const setTheme = useCallback((s: ThemeSetting) => {
    window.localStorage.setItem(STORAGE_KEY, s);
    setSettingState(s);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolve(setting) === "dark" ? "light" : "dark");
  }, [setting, setTheme]);

  const value = useMemo(
    () => ({ theme, setting, setTheme, toggle }),
    [theme, setting, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
