// 「哪个语言挂在网站根路径」的单一真源（SSOT）。
//
// 主站根路径 = 英文：品牌词 hulianui / hulian ui 是英文查询，落地页必须是根域上的英文页；
// 中文版挂 NESTED_BASE_PATH。改下面两个常量即等于整站语言布局翻转 —— next.config.mjs 的
// basePath、双语构建的合并方向、sitemap / canonical / hreflang、链接校验脚本全部从这里派生。
//
// 硬规则：任何地方都不要再写 "/en" / "/zh" 字面量。散落的字面量正是上一版把英文页
// 漏出 sitemap、又把 canonical 指到会 308 的地址的根源。
export const ROOT_LOCALE = "en";
export const NESTED_LOCALE = "zh-CN";
export const NESTED_BASE_PATH = "/zh";

/** 两个语种，根语言在前。 */
export const DOCS_LOCALES = [ROOT_LOCALE, NESTED_LOCALE];

/**
 * Next 的 basePath。根语言为空串，嵌套语言带前缀且**不带**尾斜杠 —— Next 要求如此。
 * 对外 URL 请勿用它拼，用 localeCanonicalPath。
 */
export function basePathForLocale(locale) {
  return locale === ROOT_LOCALE ? "" : NESTED_BASE_PATH;
}

/** 去掉语言前缀，得到与语言无关的「裸路由」（始终以 / 开头）。 */
export function stripLocalePrefix(pathname) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === NESTED_BASE_PATH || path === `${NESTED_BASE_PATH}/`) return "/";
  return path.startsWith(`${NESTED_BASE_PATH}/`) ? path.slice(NESTED_BASE_PATH.length) : path;
}

/** 该路径属于哪个语言。 */
export function localeFromPathname(pathname) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return path === NESTED_BASE_PATH || path.startsWith(`${NESTED_BASE_PATH}/`)
    ? NESTED_LOCALE
    : ROOT_LOCALE;
}

/**
 * 站内路由形式（<Link href> / router.push 用）。嵌套语言首页是 "/zh"，无尾斜杠，
 * 与 Next basePath 的拼接结果一致。
 */
export function localeRoutePath(pathname, locale) {
  const bare = stripLocalePrefix(pathname);
  if (locale === ROOT_LOCALE) return bare;
  return bare === "/" ? NESTED_BASE_PATH : `${NESTED_BASE_PATH}${bare}`;
}

/**
 * 对外 URL 的路径形式（canonical / hreflang / sitemap 用）。
 *
 * 与 localeRoutePath 的唯一差别：嵌套语言首页带尾斜杠（"/zh/"）。静态托管把 /zh 当目录，
 * 会 308 到 /zh/ —— 实测过。canonical 或 sitemap 指向一个会跳转的 URL 属于软错误，
 * 必须写成最终可达形式。
 */
export function localeCanonicalPath(pathname, locale) {
  const route = localeRoutePath(pathname, locale);
  return route === NESTED_BASE_PATH ? `${NESTED_BASE_PATH}/` : route;
}

/** 对外绝对 URL。根语言首页返回带尾斜杠的 origin，与 sitemap 的写法保持一致。 */
export function localeAbsoluteUrl(pathname, locale, origin) {
  return `${origin}${localeCanonicalPath(pathname, locale)}`;
}
