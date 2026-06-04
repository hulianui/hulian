"use client";
import type { ReactNode } from "react";
import { LocaleContext, zhCN, type Locale } from "./locale";

export interface ConfigProviderProps {
  /** 全局 Locale（用导出的 zhCN/enUS 或 spread 自定义）。缺省 zhCN。 */
  locale?: Locale;
  children: ReactNode;
}

/**
 * 全局配置根。当前承载 i18n（locale）；后续可扩展默认尺寸/主题等全局项（同一 Provider 渐进增长）。
 * 通常裹在应用最外层（与 ThemeProvider 同层）。
 */
export function ConfigProvider({ locale = zhCN, children }: ConfigProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
