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
export * from "./select";
export * from "./combobox";
export * from "./accordion";
export * from "./breadcrumb";
export * from "./pagination";
export * from "./table";
export * from "./stat";
export * from "./chart";
export * from "./_mui";
export * from "./number-ticker";
export * from "./marquee";
export * from "./dot-pattern";
export * from "./grid-pattern";
export * from "./retro-grid";
export * from "./ripple";
export * from "./striped-pattern";
export * from "./drawer";
export * from "./menu";
export * from "./toast";
export * from "./progress";
export * from "./separator";
export * from "./toggle";
export * from "./meter";
export * from "./number-field";
export * from "./checkbox-group";
export * from "./toolbar";
export * from "./alert-dialog";
export * from "./scroll-area";
export * from "./form";
// effects: MagicUI 文字动画批
export * from "./aurora-text";
export * from "./animated-shiny-text";
export * from "./animated-gradient-text";
export * from "./word-rotate";
export * from "./typing-animation";
export * from "./sparkles-text";
// effects: MagicUI 特效按钮批
export * from "./shimmer-button";
export * from "./rainbow-button";
export * from "./pulsating-button";
export * from "./ripple-button";
// effects: MagicUI 特效核心批
export * from "./border-beam";
export * from "./shine-border";
export * from "./meteors";
export * from "./magic-card";
export * from "./glare-hover";
// mockups: MagicUI 设备外壳批
export * from "./safari";
export * from "./iphone";
export * from "./android";
// B 档纯皮肤基础件批
export * from "./spinner";
export * from "./chip";
export * from "./link";
export * from "./kbd";

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
