// 组件
export * from "./button";
export * from "./switch";
export * from "./dialog";

// 主题
export { ThemeProvider } from "./theme/theme-provider";
export { useTheme } from "./theme/use-theme";
export type { Theme, ThemeSetting } from "./theme/use-theme";

// 工具 + showcase 约定
export { cn } from "./lib/cn";
export type { ShowcaseSpec, Control, StateSpec, ControlType } from "./showcase/types";
