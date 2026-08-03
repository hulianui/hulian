export type DocsLocale = "zh-CN" | "en";

function isDocsLocale(value: string | undefined): value is DocsLocale {
  return value === "zh-CN" || value === "en";
}

// 语言布局的 SSOT 是 scripts/docs-locale-layout.mjs（next.config.mjs 与构建脚本要直接
// import，故必须是 .mjs）。TS 侧无法引用它，这里镜像同值，由 docs-locale.test.ts 断言
// 两侧逐字段一致 —— 任一侧改了另一侧没跟，测试立刻红。
export const ROOT_LOCALE: DocsLocale = "en";
export const NESTED_LOCALE: DocsLocale = "zh-CN";
export const NESTED_BASE_PATH = "/zh";

export const DOCS_LOCALE: DocsLocale = isDocsLocale(process.env.DOCS_LOCALE)
  ? process.env.DOCS_LOCALE
  : isDocsLocale(process.env.NEXT_PUBLIC_DOCS_LOCALE)
    ? process.env.NEXT_PUBLIC_DOCS_LOCALE
    : "zh-CN";

export const LOCALE_STORAGE_KEY = "hulian-docs-locale";

/** Next basePath：根语言为空串，嵌套语言带前缀且不带尾斜杠。 */
export function basePathForLocale(locale: DocsLocale): string {
  return locale === ROOT_LOCALE ? "" : NESTED_BASE_PATH;
}

export const DOCS_BASE_PATH = basePathForLocale(DOCS_LOCALE);

/** 去掉语言前缀，得到与语言无关的「裸路由」。 */
export function stripDocsBasePath(path: string): string {
  const value = path.startsWith("/") ? path : `/${path}`;
  if (value === NESTED_BASE_PATH || value === `${NESTED_BASE_PATH}/`) return "/";
  return value.startsWith(`${NESTED_BASE_PATH}/`)
    ? value.slice(NESTED_BASE_PATH.length)
    : value;
}

/** 该路径属于哪个语言。 */
export function localeFromPath(path: string): DocsLocale {
  const value = path.startsWith("/") ? path : `/${path}`;
  return value === NESTED_BASE_PATH || value.startsWith(`${NESTED_BASE_PATH}/`)
    ? NESTED_LOCALE
    : ROOT_LOCALE;
}

/** 站内路由形式（<Link href> / router 用）。嵌套语言首页是 "/zh"，无尾斜杠。 */
export function withDocsBasePath(path: string, locale: DocsLocale = DOCS_LOCALE): string {
  const bare = stripDocsBasePath(path);
  if (locale === ROOT_LOCALE) return bare;
  return bare === "/" ? NESTED_BASE_PATH : `${NESTED_BASE_PATH}${bare}`;
}

/**
 * 对外 URL 的路径形式（canonical / hreflang / sitemap 用）。
 *
 * 与 withDocsBasePath 的唯一差别：嵌套语言首页带尾斜杠（"/zh/"）。静态托管把无尾斜杠的
 * "/zh" 当目录并 308 到 "/zh/"，而 canonical / sitemap 指向会跳转的 URL 是软错误，
 * 必须写成最终可达形式。
 */
export function canonicalPathForLocale(path: string, locale: DocsLocale): string {
  const route = withDocsBasePath(path, locale);
  return route === NESTED_BASE_PATH ? `${NESTED_BASE_PATH}/` : route;
}

export function switchLocaleUrl(url: string, locale: DocsLocale): string {
  const parsed = new URL(url, "https://hulianui.local");
  return `${withDocsBasePath(parsed.pathname, locale)}${parsed.search}${parsed.hash}`;
}
