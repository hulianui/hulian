// 子路径入口：`import { ThemeProvider } from "@hulianui/ui/theme"`。
// 导出面与根 barrel 的「主题」段逐条对齐 —— 两个入口是同一份公共契约的两种取法，
// 不在这里额外放开内部实现（hulianui/hulian#19）。
export { ThemeProvider } from "./theme-provider";
export { useTheme, useThemeOptional, THEME_STORAGE_KEY } from "./use-theme";
export type { Theme, ThemeSetting, ThemeContextValue } from "./use-theme";
