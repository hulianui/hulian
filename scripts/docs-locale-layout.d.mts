// docs-locale-layout.mjs 的类型契约。
// 该模块必须是 .mjs（next.config.mjs 与构建脚本要直接 import），TS 侧靠这份声明消费它。
export type DocsLocale = "zh-CN" | "en";

export const ROOT_LOCALE: DocsLocale;
export const NESTED_LOCALE: DocsLocale;
export const NESTED_BASE_PATH: string;
export const DOCS_LOCALES: readonly DocsLocale[];

export function basePathForLocale(locale: DocsLocale): string;
export function stripLocalePrefix(pathname: string): string;
export function localeFromPathname(pathname: string): DocsLocale;
export function localeRoutePath(pathname: string, locale: DocsLocale): string;
export function localeCanonicalPath(pathname: string, locale: DocsLocale): string;
export function localeAbsoluteUrl(pathname: string, locale: DocsLocale, origin: string): string;
