// 瑚琏「Theme」文档区 IA + 设计 token 数据 SSOT —— 纯数据，零 @hulianui/ui import，server/client 皆可读。
// 数值真源在 @hulianui/tokens（preset.css / semantic.css）；此处镜像用于文档可视化，改 token 时同步。

import { themeMetaEn } from "../i18n/theme-meta.en";
import { DOCS_LOCALE } from "./docs-locale";

export interface ThemeNavItem {
  slug: string; // 空串 = Overview（/theme 根）
  label: string; // 中文
  en: string; // 英文副标
  blurb: string;
}

export interface LocalizedThemeDisplayMeta {
  label: string;
  description: string;
  searchAliases: string[];
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
  { slug: "motion", label: "动效", en: "Motion", blurb: "缓动曲线 / 时长 / 该不该动" },
  { slug: "cursors", label: "光标", en: "Cursors", blurb: "交互态指针语义" },
];

/** Localized display/search overlay. Theme slugs remain stable. */
export function themeMeta(item: ThemeNavItem): LocalizedThemeDisplayMeta {
  if (DOCS_LOCALE === "en") {
    const localized = themeMetaEn[item.slug || "overview"];
    return {
      ...localized,
      searchAliases: [item.label, item.en, item.blurb],
    };
  }
  return {
    label: item.label,
    description: item.blurb,
    searchAliases: [item.en],
  };
}

// ===== 断点 SSOT 镜像（真源：@hulianui/tokens preset.css @theme --breakpoint-*）=====
export interface Breakpoint {
  name: string; // sm/md/lg/xl/2xl
  px: number;
  rem: string;
  device: string;
  prefix: string; // tailwind 工具类前缀
}
const BREAKPOINTS_ZH: Breakpoint[] = [
  { name: "sm", px: 640, rem: "40rem", device: "横屏手机", prefix: "sm:" },
  { name: "md", px: 768, rem: "48rem", device: "竖屏平板", prefix: "md:" },
  { name: "lg", px: 1024, rem: "64rem", device: "横屏平板 / 小笔记本", prefix: "lg:" },
  { name: "xl", px: 1280, rem: "80rem", device: "桌面", prefix: "xl:" },
  { name: "2xl", px: 1536, rem: "96rem", device: "大桌面", prefix: "2xl:" },
];
const BREAKPOINT_DEVICE_EN: Record<string, string> = {
  sm: "Landscape phone",
  md: "Portrait tablet",
  lg: "Landscape tablet or small laptop",
  xl: "Desktop",
  "2xl": "Large desktop",
};
export const BREAKPOINTS: Breakpoint[] = BREAKPOINTS_ZH.map((item) =>
  DOCS_LOCALE === "en" ? { ...item, device: BREAKPOINT_DEVICE_EN[item.name] } : item,
);

// ===== 语义色（真源：semantic.css）=====
export interface SemanticColor {
  token: string; // CSS 变量名（去 -- 前缀）
  label: string;
  light: string; // 映射的原始色（人读）
  dark: string;
  /** 文字态：在该底色上用前景色画文字示意 */
  fg?: string;
  /** 用途约束 / 误用警示（有值则在色卡下渲染一行提示） */
  note?: string;
}
const SEMANTIC_GROUPS_ZH: { title: string; colors: SemanticColor[] }[] = [
  {
    title: "界面 / 表面",
    colors: [
      { token: "color-bg", label: "页面底", light: "gray-50", dark: "gray-950" },
      { token: "color-surface", label: "卡片表面", light: "white", dark: "gray-900" },
      { token: "color-surface-hover", label: "表面悬停", light: "gray-100", dark: "gray-800" },
      {
        token: "color-subtle",
        label: "弱背景",
        light: "gray-100",
        dark: "gray-800",
        note: "静态区域底：分组容器、看板列、泳道、说明条。与「表面悬停」当前同值但语义不同——常驻底色写 hover: 是语义错位。⚠️ 别拿「次要文字」muted 当背景用：亮色下是一块脏灰、暗色下是发白的浅灰，两个主题都错。",
      },
      { token: "color-border", label: "边框 / 分隔线", light: "gray-200", dark: "gray-800" },
      {
        token: "color-hairline",
        label: "发丝边框",
        light: "transparent",
        dark: "gray-800（同 border）",
        note: "只用于 border-*：给带阴影的表面（卡片/浮层/按钮）勾轮廓。浅色主题下它就是 transparent——用作 text- / bg- / fill- 会静默隐形（无报错、无回落），填充与文字请改用 border 或 muted。",
      },
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
      {
        token: "color-primary",
        label: "主色",
        light: "brand-700",
        dark: "brand-400",
        fg: "color-primary-foreground",
      },
      {
        token: "color-primary-hover",
        label: "主色悬停",
        light: "brand-500",
        dark: "brand-500",
        note: "语义色的悬停档一律取「亮暗两端之间的那一档」：亮色下变亮、暗色下变暗，两个主题都朝对比更弱的方向走一步。",
      },
      { token: "color-ring", label: "焦点环", light: "brand-500", dark: "brand-400" },
    ],
  },
  {
    title: "状态",
    colors: [
      {
        token: "color-danger",
        label: "危险",
        light: "danger-700",
        dark: "danger-400",
        fg: "color-danger-foreground",
      },
      { token: "color-danger-hover", label: "危险悬停", light: "danger-500", dark: "danger-500" },
      {
        token: "color-success",
        label: "成功",
        light: "success-700",
        dark: "success-500",
        fg: "color-success-foreground",
      },
      { token: "color-success-hover", label: "成功悬停", light: "success-600", dark: "success-600" },
      {
        token: "color-warning",
        label: "警告",
        light: "warning-700",
        dark: "warning-500",
        fg: "color-warning-foreground",
      },
      { token: "color-warning-hover", label: "警告悬停", light: "warning-600", dark: "warning-600" },
    ],
  },
];
const SEMANTIC_GROUP_EN = ["Interface and surfaces", "Text", "Brand and emphasis", "Status"];
const SEMANTIC_COLOR_EN: Record<string, { label: string; note?: string }> = {
  "color-bg": { label: "Page background" },
  "color-surface": { label: "Card surface" },
  "color-surface-hover": { label: "Hovered surface" },
  "color-subtle": {
    label: "Subtle background",
    note: "Static area backgrounds: grouping containers, board columns, swim lanes, note strips. It currently resolves to the same value as the hovered surface but means something different — writing hover: for a permanent background is a semantic mismatch. Never use the secondary text colour (muted) as a background: it reads as dirty grey in light mode and washed-out grey in dark mode.",
  },
  "color-border": { label: "Borders and dividers" },
  "color-hairline": {
    label: "Hairline border",
    note: "Use only with border-* on elevated surfaces. It is transparent in light mode; text-, bg-, or fill- would become invisible, so use border or muted for fill and text.",
  },
  "color-foreground": { label: "Primary text" },
  "color-muted": { label: "Secondary text" },
  "color-primary": { label: "Primary" },
  "color-primary-hover": {
    label: "Primary hover",
    note: "Every semantic hover token picks the step between the light and dark values, so it moves one step towards lower contrast in both themes.",
  },
  "color-ring": { label: "Focus ring" },
  "color-danger": { label: "Danger" },
  "color-danger-hover": { label: "Danger hover" },
  "color-success": { label: "Success" },
  "color-success-hover": { label: "Success hover" },
  "color-warning": { label: "Warning" },
  "color-warning-hover": { label: "Warning hover" },
};
export const SEMANTIC_GROUPS: { title: string; colors: SemanticColor[] }[] =
  DOCS_LOCALE === "en"
    ? SEMANTIC_GROUPS_ZH.map((group, index) => ({
        title: SEMANTIC_GROUP_EN[index],
        colors: group.colors.map((color) => ({
          ...color,
          ...(color.token === "color-hairline" ? { dark: "gray-800 (same as border)" } : {}),
          ...SEMANTIC_COLOR_EN[color.token],
        })),
      }))
    : SEMANTIC_GROUPS_ZH;

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
const FONT_WEIGHTS_ZH = [
  { name: "font-normal", value: 400, label: "正文" },
  { name: "font-medium", value: 500, label: "次强调 / 导航" },
  { name: "font-semibold", value: 600, label: "标题" },
  { name: "font-bold", value: 700, label: "重强调" },
];
const FONT_WEIGHT_EN = ["Body", "Secondary emphasis and navigation", "Headings", "Strong emphasis"];
export const FONT_WEIGHTS = FONT_WEIGHTS_ZH.map((weight, index) =>
  DOCS_LOCALE === "en" ? { ...weight, label: FONT_WEIGHT_EN[index] } : weight,
);

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
const SHADOW_SCALE_ZH = [
  { name: "shadow-xs", use: "细微浮起 · 输入/徽标" },
  { name: "shadow-sm", use: "卡片 / 主按钮" },
  { name: "shadow-md", use: "悬浮卡片 / 下拉" },
  { name: "shadow-lg", use: "弹层 / Popover" },
  { name: "shadow-xl", use: "对话框 / 抽屉" },
  { name: "shadow-2xl", use: "命令面板 / 大模态" },
];
const SHADOW_USE_EN = [
  "Subtle lift: inputs and badges",
  "Cards and primary buttons",
  "Floating cards and menus",
  "Popovers",
  "Dialogs and drawers",
  "Command palettes and large modals",
];
export const SHADOW_SCALE = SHADOW_SCALE_ZH.map((shadow, index) =>
  DOCS_LOCALE === "en" ? { ...shadow, use: SHADOW_USE_EN[index] } : shadow,
);

// ===== 动效（真源：@hulianui/tokens preset.css @theme --ease-* + @hulianui/ui motion/tokens.ts）=====
// 三处必须同值：preset.css 的 @theme（工具类）、motion/tokens.ts 的 JS/CSS 双镜像、此处文档镜像。
export interface EasingToken {
  /** Tailwind 工具类（--ease-drawer 无对应类时留空） */
  utility: string;
  cssVar: string;
  curve: string;
  label: string;
  use: string;
}
const EASINGS_ZH: EasingToken[] = [
  {
    utility: "ease-out",
    cssVar: "--ease-out",
    curve: "cubic-bezier(0.16, 1, 0.3, 1)",
    label: "减速（默认档）",
    use: "进场 / 退场 / hover / 按压 —— 起步即最快，用户第一眼就看到位移，因此「感觉」比同时长的其它曲线更跟手。不确定用哪条时用它。",
  },
  {
    utility: "ease-in-out",
    cssVar: "--ease-in-out",
    curve: "cubic-bezier(0.65, 0, 0.35, 1)",
    label: "加速后减速",
    use: "元素在屏内位移 / 形变（不涉及出现与消失）。两端都平缓，像真实物体起步与停稳。",
  },
  {
    utility: "—",
    cssVar: "--ease-drawer",
    curve: "cubic-bezier(0.32, 0.72, 0, 1)",
    label: "抽屉（iOS / Ionic）",
    use: "整屏尺度的滑入滑出：Drawer、ActionSheet。尾段比 ease-out 长得多，大面积位移才不会「冲到位再急停」。",
  },
];
const EASINGS_EN = [
  {
    label: "Deceleration (default)",
    use: "Entrance, exit, hover, and press feedback. It starts at full speed, so users see an immediate response. Use this curve when unsure.",
  },
  {
    label: "Accelerate, then decelerate",
    use: "Movement or transformation within the viewport. Both ends are gentle, like a physical object starting and stopping.",
  },
  {
    label: "Drawer (iOS and Ionic)",
    use: "Full-screen sliding surfaces such as Drawer and ActionSheet. Its longer tail prevents large surfaces from stopping abruptly.",
  },
];
export const EASINGS: EasingToken[] = EASINGS_ZH.map((easing, index) =>
  DOCS_LOCALE === "en" ? { ...easing, ...EASINGS_EN[index] } : easing,
);

export interface DurationToken {
  name: string; // motionDuration 的键
  ms: number;
  utility: string;
  use: string;
}
const DURATIONS_ZH: DurationToken[] = [
  { name: "fast", ms: 150, utility: "duration-150", use: "按压反馈 / 贴身微交互（100–160ms）" },
  {
    name: "base",
    ms: 200,
    utility: "duration-200",
    use: "浮层进出场：Tooltip、Popover、Select、Menu",
  },
  {
    name: "slow",
    ms: 300,
    utility: "duration-300",
    use: "大块转场：Drawer / ActionSheet 面板滑动",
  },
  {
    name: "entrance",
    ms: 600,
    utility: "duration-600",
    use: "首屏逐级揭示 / 滚动入场（非交互反馈，可从容）",
  },
];
const DURATION_USE_EN = [
  "Press feedback and close micro-interactions (100-160ms)",
  "Overlay entrances and exits: Tooltip, Popover, Select, and Menu",
  "Large transitions: Drawer and ActionSheet panels",
  "First-paint reveals and scroll entrances, not interaction feedback",
];
export const DURATIONS: DurationToken[] = DURATIONS_ZH.map((duration, index) =>
  DOCS_LOCALE === "en" ? { ...duration, use: DURATION_USE_EN[index] } : duration,
);

/** 该不该动 —— 按用户一天看到它多少次决定，而不是按「好不好看」 */
const MOTION_FREQUENCY_ZH = [
  {
    freq: "每天 100+ 次",
    example: "⌘K 命令面板、键盘快捷键",
    verdict: "不做动画",
    tone: "danger" as const,
  },
  {
    freq: "每天几十次",
    example: "hover 态、列表导航",
    verdict: "去掉或大幅削减",
    tone: "warning" as const,
  },
  { freq: "偶尔", example: "对话框、抽屉、Toast", verdict: "常规动效", tone: "neutral" as const },
  {
    freq: "罕见 / 首次",
    example: "引导、成功庆祝",
    verdict: "可以有惊喜",
    tone: "success" as const,
  },
];
const MOTION_FREQUENCY_EN = [
  {
    freq: "100+ times a day",
    example: "Command palette and keyboard shortcuts",
    verdict: "No animation",
  },
  {
    freq: "Dozens of times a day",
    example: "Hover states and list navigation",
    verdict: "Remove or greatly reduce",
  },
  { freq: "Occasionally", example: "Dialogs, drawers, and toasts", verdict: "Standard motion" },
  {
    freq: "Rarely or once",
    example: "Onboarding and success celebrations",
    verdict: "A moment of delight is appropriate",
  },
];
export const MOTION_FREQUENCY = MOTION_FREQUENCY_ZH.map((row, index) =>
  DOCS_LOCALE === "en" ? { ...row, ...MOTION_FREQUENCY_EN[index] } : row,
);

// ===== 光标（交互态指针语义）=====
const CURSORS_ZH = [
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
const CURSOR_USE_EN = [
  "Default arrow",
  "Clickable link or button",
  "Selectable or editable text",
  "Draggable movement",
  "Grabbable carousel or sortable item",
  "Disabled state",
  "Loading",
  "Horizontal resizing",
  "Vertical resizing",
  "Help information",
];
export const CURSORS = CURSORS_ZH.map((cursor, index) =>
  DOCS_LOCALE === "en" ? { ...cursor, use: CURSOR_USE_EN[index] } : cursor,
);
