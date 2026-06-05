// 组件
export * from "./button";
export * from "./switch";
export * from "./dialog";
export * from "./badge";
export * from "./dot";
export * from "./status-dot";
export * from "./tag";
export * from "./steps";
export * from "./card";
export * from "./skeleton";
export * from "./avatar";
export * from "./input";
export * from "./textarea";
export * from "./field";
export * from "./secret-field";
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
export * from "./page-header";
export * from "./descriptions";
export * from "./pagination";
export * from "./table";
export * from "./pro-table";
export * from "./editable-table";
export * from "./pricing-table";
export * from "./json-viewer";
export * from "./kanban";
export * from "./flow";
export * from "./watermark";
export * from "./carousel";
export * from "./resizable";
export * from "./affix";
export * from "./timeline";
export * from "./stat";
export * from "./chart";
export * from "./_mui";
export * from "./date-range-picker";
export * from "./number-ticker";
export * from "./marquee";
export * from "./dot-pattern";
export * from "./grid-pattern";
export * from "./retro-grid";
export * from "./ripple";
export * from "./striped-pattern";
export * from "./spotlight";
export * from "./drawer";
export * from "./menu";
export * from "./context-menu";
export * from "./hover-card";
export * from "./toast";
export * from "./modal";
export * from "./notification";
export * from "./service-message";
export * from "./spin";
export * from "./divider";
export * from "./back-top";
export * from "./statistic";
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
export * from "./form-dialog";
export * from "./pro-form";
export * from "./login-form";
export * from "./steps-form";
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
// effects: 设计感背景批（复刻 react-bits/Aceternity·canvas 零依赖 + WebGL/ogl 懒加载·全吃 chart token）
export * from "./aurora";
export * from "./particles";
export * from "./flickering-grid";
export * from "./wavy-background";
export * from "./card-spotlight";
export * from "./silk";
export * from "./iridescence";
export * from "./threads";
export * from "./orb";
export * from "./liquid-chrome";
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
export * from "./coupon";
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
export * from "./nav-menu";
export * from "./tree";
export * from "./tree-select";
export * from "./cascader";
export * from "./region-cascader";
export * from "./country-select";
export * from "./input-otp";
export * from "./listbox";
export * from "./markdown-editor";
export * from "./markdown";
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
export * from "./video";
export * from "./tour";
export * from "./world-map";
// 布局/结构批（零依赖·RSC 友好）
export * from "./stack";
export * from "./grid";
export * from "./aspect-ratio";
export * from "./fit-screen";
export * from "./empty";
// 中后台数据列表（零依赖自研·复合 List/ListItem/ListItem.Meta·复用 Empty/Pagination/Avatar/User）
export * from "./list";
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
export * from "./layout";
export * from "./admin-layout";
export * from "./popconfirm";
export * from "./menubar";
export * from "./navigation-menu";
// AI 智能体（对话 / 推理与工具 / 辅助·复用 Avatar/Textarea/Collapsible/Dot/Prose）
export * from "./typing-dots";
export * from "./chat-message";
export * from "./conversation";
export * from "./prompt-input";
export * from "./thinking-block";
export * from "./tool-call";
export * from "./agent-plan";
export * from "./task-runner";
export * from "./prompt-suggestions";
export * from "./message-actions";
export * from "./citation";
export * from "./streaming-text";

// 主题
export { ThemeProvider } from "./theme/theme-provider";
export { useTheme } from "./theme/use-theme";
export type { Theme, ThemeSetting } from "./theme/use-theme";

// 权限（基础设施·不进组件画廊·同 ThemeProvider 先例）
export { AccessProvider } from "./access/access-provider";
export type { AccessProviderProps } from "./access/access-provider";
export { Access } from "./access/access";
export type { AccessProps } from "./access/access";
export { useAccess } from "./access/use-access";
export type { AccessContextValue } from "./access/use-access";

// 全局配置 / i18n（基础设施·不进组件画廊）
export { ConfigProvider } from "./config/config-provider";
export type { ConfigProviderProps } from "./config/config-provider";
export { useLocale, zhCN, enUS } from "./config/locale";
export type { Locale } from "./config/locale";

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
export * from "./sortable";

// 移动端 / H5（触屏交互 + 安全区）
export * from "./safe-area";
export * from "./fab";
export * from "./tab-bar";
export * from "./action-sheet";
export * from "./swipe-action";
export * from "./pull-to-refresh";
export * from "./picker";

// 数据展示补充（虚拟滚动 / 无限加载 / 二维码）
export * from "./virtual-list";
export * from "./infinite-scroll";
export * from "./qrcode";

// 响应式容器（容器查询上下文 + web/平板/手机 预设）
export * from "./viewport";

// 工程/单据/排期 批（demo dogfood 驱动）
export * from "./masonry";
export * from "./document-sheet";
export * from "./gantt";
export * from "./scheduler";
export * from "./image-viewer";

// devtools / 执行态 批（运行输出可视化·承 TaskRunner 品类）
export * from "./log-viewer";
export * from "./code-diff";
// 代码审查质检批（瀚审 HanReview demo dogfood）
export * from "./diff-stat";
export * from "./score-ring";
export * from "./heatmap";
export * from "./code-review-thread";
// 智能体任务调度可视化批（瀚舵 HanHelm demo dogfood）
export * from "./sankey";
export * from "./sparkline";
export * from "./funnel";
export * from "./queue-lane";
export * from "./file-tree";

// shadcnblocks 缺口补齐批（按钮组/第三方登录/公告条/相对时间/卡片选择/银行卡/表情/链接预览）
export * from "./button-group";
export * from "./social-button";
export * from "./banner";
export * from "./relative-time";
export * from "./choicebox";
export * from "./credit-card";
export * from "./emoji-picker";
export * from "./glimpse";

// 工具 + showcase 约定
export { cn } from "./lib/cn";
// 日期 SSoT（消费者需 dayjs 做日期数学时从这里取，避免各自装一份/版本漂移）
export { dayjs, DATE_FORMAT, TIME_FORMAT, DATE_TIME_FORMAT } from "./lib/date";
export type { Dayjs } from "./lib/date";
export type { ShowcaseSpec, Control, StateSpec, ControlType } from "./showcase/types";
