import { DOCS_LOCALE, withDocsBasePath, type DocsLocale } from "../../../lib/docs-locale";

/** Components with a dedicated locale prop use a shorter locale code than ConfigProvider. */
export const DEMO_RELATIVE_TIME_LOCALE = DOCS_LOCALE === "en" ? "en" : "zh";

/** Keep native anchors inside the active static docs locale. */
export function demoHref(path: string, locale: DocsLocale = DOCS_LOCALE): string {
  return withDocsBasePath(path, locale);
}
