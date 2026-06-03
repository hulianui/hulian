import { createTheme } from "@mui/material/styles";

// 瑚琏 MUI 桥主题：palette 槽位全读瑚琏 CSS 变量（单一真源），data-theme 切换实时换色。
// ⚠️ 每个调色槽给齐 {main,light,dark,contrastText} → MUI createPalette 的 augmentColor
//    检测到齐全就跳过 lighten/darken/getContrastText（它们无法解析 var() 会 NaN/抛错）。
// ⚠️ shape.borderRadius 必须是数字（不能 var()）→ 用 10（≈ --radius 0.625rem，此处刻意复制）。
// ⚠️ action.hover/selected 用 color-mix 替代 MUI 运行时 alpha(main)（alpha 同样吃不了 var()）。
export const hulianMuiTheme = createTheme({
  palette: {
    primary: {
      main: "var(--color-primary)",
      light: "var(--color-primary-hover)",
      dark: "var(--color-primary-hover)",
      contrastText: "var(--color-primary-foreground)",
    },
    error: {
      main: "var(--color-danger)",
      light: "var(--color-danger)",
      dark: "var(--color-danger)",
      contrastText: "var(--color-danger-foreground)",
    },
    background: { default: "var(--color-bg)", paper: "var(--color-surface)" },
    text: {
      primary: "var(--color-foreground)",
      secondary: "var(--color-muted)",
      disabled: "var(--color-muted)",
    },
    divider: "var(--color-border)",
    action: {
      active: "var(--color-foreground)",
      hover: "color-mix(in srgb, var(--color-foreground) 6%, transparent)",
      selected: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
      disabled: "var(--color-muted)",
      disabledBackground: "var(--color-surface-hover)",
    },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "inherit" },
});

// ⚠️ MUI 核心组件（如 IconButton：日期族头部箭头/打开日历按钮）的 root 样式经 memoTheme **eager**
//    对每个 palette 颜色调用 theme.alpha(palette[c].main / action.active, hoverOpacity) 算 hover 底色。
//    桥主题这些槽位是 var(--color-*)，MUI colorManipulator 解析不了 var() → 抛 "Unsupported color"
//    （真实浏览器同样触发，非仅 jsdom；disableRipple 无效——变体在序列化时已全量求值）。
//    集中把 theme.alpha 重写为 color-mix（与上面 action.* 同款手法），保留 var() 单一真源，
//    令所有桥件（现有 Rating/Stepper + 日期族 + 未来件）一处受益、无需 per-component 克隆主题。
hulianMuiTheme.alpha = (color: string, coefficient: string | number) =>
  `color-mix(in srgb, ${color} ${Math.round(Number(coefficient) * 100)}%, transparent)`;
