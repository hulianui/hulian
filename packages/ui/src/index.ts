// 组件
export * from "./button";
export * from "./switch";
export * from "./dialog";
export * from "./badge";
export * from "./card";
export * from "./skeleton";
export * from "./avatar";
export * from "./input";
export * from "./textarea";
export * from "./field";
export * from "./checkbox";
export * from "./radio";
export * from "./slider";
export * from "./alert";
export * from "./tabs";
export * from "./tooltip";
export * from "./popover";
export * from "./accordion";

// 主题
export { ThemeProvider } from "./theme/theme-provider";
export { useTheme } from "./theme/use-theme";
export type { Theme, ThemeSetting } from "./theme/use-theme";

// 动效基元（时长/曲线 token + 预设）
export {
  motionDuration,
  motionDurationCss,
  motionEase,
  motionEaseCss,
  pressable,
  fadeScale,
  shimmer,
} from "./motion";

// 工具 + showcase 约定
export { cn } from "./lib/cn";
export type { ShowcaseSpec, Control, StateSpec, ControlType } from "./showcase/types";
