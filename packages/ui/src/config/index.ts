// 子路径入口：`import { ConfigProvider } from "@hulianui/ui/config"`。
// 导出面与根 barrel 的「全局配置 / i18n」段逐条对齐（hulianui/hulian#19）。
export { ConfigProvider } from "./config-provider";
export type { ConfigProviderProps } from "./config-provider";
export { useLocale, zhCN, enUS } from "./locale";
export type { Locale } from "./locale";
