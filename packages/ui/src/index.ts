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
export * from "./collapsible";
export * from "./segmented";
export * from "./breadcrumb";
export * from "./anchor";
export * from "./descriptions";
export * from "./pagination";
export * from "./table";
export * from "./watermark";
export * from "./carousel";
export * from "./resizable";
export * from "./timeline";
export * from "./affix";
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
export * from "./context-menu";
export * from "./hover-card";
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
export * from "./chrome";
export * from "./iphone";
export * from "./android";
export * from "./tablet";
export * from "./watch";
// B 档纯皮肤基础件批
export * from "./spinner";
export * from "./chip";
export * from "./link";
export * from "./kbd";
export * from "./code";
export * from "./code-block";
export * from "./snippet";
// HeroUI 缺口零依赖合集（皮肤/布局/轻交互）
export * from "./spacer";
export * from "./user";
export * from "./comment";
export * from "./image";
export * from "./navbar";
export * from "./input-otp";
export * from "./listbox";
export * from "./mentions";
export * from "./command";
export * from "./colorpicker";
export * from "./color-swatch-picker";
// MagicUI 缺口收尾批（零依赖：纯 CSS/SVG/motion）
export * from "./avatar-circles";
export * from "./orbiting-circles";
export * from "./animated-list";
export * from "./progressive-blur";
export * from "./dock";
export * from "./lens";
export * from "./terminal";
export * from "./bento-grid";
export * from "./animated-theme-toggler";
export * from "./animated-beam";
export * from "./hero-video-dialog";
export * from "./tour";
export * from "./world-map";
// 布局/结构批（零依赖·RSC 友好）
export * from "./stack";
export * from "./grid";
export * from "./aspect-ratio";
export * from "./empty";
// 结果页（零依赖·RSC 友好·状态反馈/错误页）
export * from "./result";
// 表单录入补充（零依赖自研·吸取 Ant Upload 概念）
export * from "./upload";
// 穿梭框（零依赖自研·复用 Listbox 双面板 + Empty 空态）
export * from "./transfer";
// 排版族（纯皮肤·零依赖·RSC 友好·全吃语义 token）
export * from "./heading";
export * from "./text";
export * from "./prose";

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

export * from "./search-form";

// 工具 + showcase 约定
export { cn } from "./lib/cn";
export type { ShowcaseSpec, Control, StateSpec, ControlType } from "./showcase/types";
