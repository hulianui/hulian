// 瑚琏「Theme」文档区 IA + 设计 token 数据 SSOT —— 纯数据，零 @hulianui/ui import，server/client 皆可读。
// 数值真源在 @hulianui/tokens（preset.css / semantic.css）；此处镜像用于文档可视化，改 token 时同步。

export interface ThemeNavItem {
  slug: string; // 空串 = Overview（/theme 根）
  label: string; // 中文
  en: string; // 英文副标
  blurb: string;
}

export const THEME_NAV: ThemeNavItem[] = [
  { slug: "", label: "总览", en: "Overview", blurb: "token 分层与消费方式" },
  { slug: "color", label: "颜色", en: "Color", blurb: "语义色 + 原始色板 + 图表色" },
  { slug: "dark-mode", label: "暗色模式", en: "Dark mode", blurb: "data-theme 切换 + 0 闪烁" },
  { slug: "typography", label: "排版", en: "Typography", blurb: "字号 / 字重 / 行高比例" },
  { slug: "spacing", label: "间距", en: "Spacing", blurb: "0.25rem 基准间距阶梯" },
  { slug: "breakpoints", label: "断点", en: "Breakpoints", blurb: "响应式断点与用法" },
  { slug: "radius", label: "圆角", en: "Radius", blurb: "--radius 基准与派生" },
  { slug: "shadows", label: "阴影", en: "Shadows", blurb: "层级投影比例" },
  { slug: "cursors", label: "光标", en: "Cursors", blurb: "交互态指针语义" },
];

// ===== 断点 SSOT 镜像（真源：@hulianui/tokens preset.css @theme --breakpoint-*）=====
export interface Breakpoint {
  name: string; // sm/md/lg/xl/2xl
  px: number;
  rem: string;
  device: string;
  prefix: string; // tailwind 工具类前缀
}
export const BREAKPOINTS: Breakpoint[] = [
  { name: "sm", px: 640, rem: "40rem", device: "横屏手机", prefix: "sm:" },
  { name: "md", px: 768, rem: "48rem", device: "竖屏平板", prefix: "md:" },
  { name: "lg", px: 1024, rem: "64rem", device: "横屏平板 / 小笔记本", prefix: "lg:" },
  { name: "xl", px: 1280, rem: "80rem", device: "桌面", prefix: "xl:" },
  { name: "2xl", px: 1536, rem: "96rem", device: "大桌面", prefix: "2xl:" },
];

// ===== 语义色（真源：semantic.css）=====
export interface SemanticColor {
  token: string; // CSS 变量名（去 -- 前缀）
  label: string;
  light: string; // 映射的原始色（人读）
  dark: string;
  /** 文字态：在该底色上用前景色画文字示意 */
  fg?: string;
}
export const SEMANTIC_GROUPS: { title: string; colors: SemanticColor[] }[] = [
  {
    title: "界面 / 表面",
    colors: [
      { token: "color-bg", label: "页面底", light: "gray-50", dark: "gray-950" },
      { token: "color-surface", label: "卡片表面", light: "white", dark: "gray-900" },
      { token: "color-surface-hover", label: "表面悬停", light: "gray-100", dark: "gray-800" },
      { token: "color-border", label: "边框 / 发丝线", light: "gray-200", dark: "gray-800" },
    ],
  },
  {
    title: "文字",
    colors: [
      { token: "color-foreground", label: "主文字", light: "gray-900", dark: "gray-50" },
      { token: "color-muted", label: "次要文字", light: "gray-500", dark: "gray-400" },
    ],
  },
  {
    title: "品牌 / 强调",
    colors: [
      { token: "color-primary", label: "主色", light: "brand-600", dark: "brand-500", fg: "color-primary-foreground" },
      { token: "color-primary-hover", label: "主色悬停", light: "brand-500", dark: "brand-400" },
      { token: "color-ring", label: "焦点环", light: "brand-500", dark: "brand-400" },
    ],
  },
  {
    title: "状态",
    colors: [
      { token: "color-danger", label: "危险", light: "danger-600", dark: "danger-500", fg: "color-danger-foreground" },
      { token: "color-success", label: "成功", light: "success-600", dark: "success-500", fg: "color-success-foreground" },
      { token: "color-warning", label: "警告", light: "warning-600", dark: "warning-500", fg: "color-warning-foreground" },
    ],
  },
];

// 图表分类色（数据序列）
export const CHART_COLORS = ["color-chart-1", "color-chart-2", "color-chart-3", "color-chart-4"];

// 原始色板（primitives.css 灰阶）
export const GRAY_SCALE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
  (n) => `gray-${n}`,
);

// ===== 排版（Tailwind v4 默认 text-* 比例，瑚琏全站沿用）=====
export interface TypeStep {
  name: string; // text-xs ...
  size: string; // rem
  px: number;
  lineHeight: string;
}
export const TYPE_SCALE: TypeStep[] = [
  { name: "text-xs", size: "0.75rem", px: 12, lineHeight: "1rem" },
  { name: "text-sm", size: "0.875rem", px: 14, lineHeight: "1.25rem" },
  { name: "text-base", size: "1rem", px: 16, lineHeight: "1.5rem" },
  { name: "text-lg", size: "1.125rem", px: 18, lineHeight: "1.75rem" },
  { name: "text-xl", size: "1.25rem", px: 20, lineHeight: "1.75rem" },
  { name: "text-2xl", size: "1.5rem", px: 24, lineHeight: "2rem" },
  { name: "text-3xl", size: "1.875rem", px: 30, lineHeight: "2.25rem" },
  { name: "text-4xl", size: "2.25rem", px: 36, lineHeight: "2.5rem" },
  { name: "text-5xl", size: "3rem", px: 48, lineHeight: "1" },
];
export const FONT_WEIGHTS = [
  { name: "font-normal", value: 400, label: "正文" },
  { name: "font-medium", value: 500, label: "次强调 / 导航" },
  { name: "font-semibold", value: 600, label: "标题" },
  { name: "font-bold", value: 700, label: "重强调" },
];

// ===== 间距（Tailwind 4 = 0.25rem 基准）=====
export const SPACING_STEPS = [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24].map((n) => ({
  step: n,
  rem: `${n * 0.25}rem`,
  px: n * 4,
}));

// ===== 圆角（真源：--radius = 0.625rem，Tailwind rounded-* 派生）=====
export const RADIUS_TOKEN = { name: "--radius", rem: "0.625rem", px: 10 };
export const RADIUS_SCALE = [
  { name: "rounded-sm", rem: "0.25rem", px: 4 },
  { name: "rounded-md", rem: "0.375rem", px: 6 },
  { name: "rounded-lg", rem: "0.5rem", px: 8 },
  { name: "rounded-[var(--radius)]", rem: "0.625rem", px: 10 },
  { name: "rounded-xl", rem: "0.75rem", px: 12 },
  { name: "rounded-2xl", rem: "1rem", px: 16 },
  { name: "rounded-full", rem: "9999px", px: 9999 },
];

// ===== 阴影（Tailwind v4 默认 shadow-* 比例）=====
export const SHADOW_SCALE = [
  { name: "shadow-xs", use: "细微浮起 · 输入/徽标" },
  { name: "shadow-sm", use: "卡片 / 主按钮" },
  { name: "shadow-md", use: "悬浮卡片 / 下拉" },
  { name: "shadow-lg", use: "弹层 / Popover" },
  { name: "shadow-xl", use: "对话框 / 抽屉" },
  { name: "shadow-2xl", use: "命令面板 / 大模态" },
];

// ===== 光标（交互态指针语义）=====
export const CURSORS = [
  { name: "cursor-default", use: "默认箭头" },
  { name: "cursor-pointer", use: "可点击 · 链接/按钮" },
  { name: "cursor-text", use: "文本可选/输入" },
  { name: "cursor-move", use: "可拖拽移动" },
  { name: "cursor-grab", use: "可抓取（轮播/排序）" },
  { name: "cursor-not-allowed", use: "禁用态" },
  { name: "cursor-wait", use: "加载中" },
  { name: "cursor-ew-resize", use: "横向缩放 · Resizable" },
  { name: "cursor-ns-resize", use: "纵向缩放" },
  { name: "cursor-help", use: "帮助提示" },
];
