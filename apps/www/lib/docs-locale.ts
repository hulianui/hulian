export type DocsLocale = "zh-CN" | "en";

function isDocsLocale(value: string | undefined): value is DocsLocale {
  return value === "zh-CN" || value === "en";
}

export const DOCS_LOCALE: DocsLocale = isDocsLocale(process.env.DOCS_LOCALE)
  ? process.env.DOCS_LOCALE
  : isDocsLocale(process.env.NEXT_PUBLIC_DOCS_LOCALE)
    ? process.env.NEXT_PUBLIC_DOCS_LOCALE
    : "zh-CN";

export const DOCS_BASE_PATH = DOCS_LOCALE === "en" ? "/en" : "";
export const LOCALE_STORAGE_KEY = "hulian-docs-locale";

export function stripDocsBasePath(path: string): string {
  return path === "/en" ? "/" : path.startsWith("/en/") ? path.slice(3) : path;
}

export function withDocsBasePath(
  path: string,
  locale: DocsLocale = DOCS_LOCALE,
): string {
  const bare = stripDocsBasePath(path.startsWith("/") ? path : `/${path}`);
  return locale === "en" ? `/en${bare === "/" ? "" : bare}` : bare;
}

export function switchLocaleUrl(url: string, locale: DocsLocale): string {
  const parsed = new URL(url, "https://hulianui.local");
  return `${withDocsBasePath(parsed.pathname, locale)}${parsed.search}${parsed.hash}`;
}

export function defaultLocaleForHost(
  host: string,
  stored: string | null,
): DocsLocale {
  if (stored && isDocsLocale(stored)) {
    return stored;
  }

  return host.toLowerCase().split(":")[0] === "hulianui.haloritual.com"
    ? "en"
    : "zh-CN";
}
