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
}: {
  children: ReactNode;
  defaultSetting?: ThemeSetting;
}) {
  const [setting, setSettingState] = useState<ThemeSetting>(defaultSetting);
  const [theme, setThemeState] = useState<Theme>(() => resolve(defaultSetting));

  // hydrate from storage once on mount
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeSetting | null;
    const s = stored ?? defaultSetting;
    setSettingState(s);
    setThemeState(resolve(s));
  }, [defaultSetting]);

  // reflect to <html data-theme> + react to system changes when setting=system
  useEffect(() => {
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
  }, [setting]);

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
