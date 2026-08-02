import {
  DOCS_LOCALE,
  stripDocsBasePath,
  withDocsBasePath,
  type DocsLocale,
} from "../../../lib/docs-locale";

/** Components with a dedicated locale prop use a shorter locale code than ConfigProvider. */
export const DEMO_RELATIVE_TIME_LOCALE = DOCS_LOCALE === "en" ? "en" : "zh";

/**
 * Internal path for next/link and next/navigation. Next applies the active
 * build's basePath itself, so returning /en here would produce /en/en links.
 */
export function demoHref(path: string, _locale: DocsLocale = DOCS_LOCALE): string {
  return stripDocsBasePath(path.startsWith("/") ? path : `/${path}`);
}

/** Full browser location for native anchors and window.location assignments. */
export function demoLocationHref(path: string, locale: DocsLocale = DOCS_LOCALE): string {
  return withDocsBasePath(path, locale);
}
