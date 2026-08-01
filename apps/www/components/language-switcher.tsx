"use client";

import { useEffect, useState, type MouseEvent } from "react";
import {
  DOCS_LOCALE,
  LOCALE_STORAGE_KEY,
  switchLocaleUrl,
  withDocsBasePath,
  type DocsLocale,
} from "../lib/docs-locale";

const localeOptions = [
  { locale: "zh-CN", label: "中文", ariaLabel: "切换到中文" },
  { locale: "en", label: "EN", ariaLabel: "Switch to English" },
] as const;

function getCurrentBrowserUrl() {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

export function LanguageSwitcher({ pathname }: { pathname?: string }) {
  const [currentUrl, setCurrentUrl] = useState(() =>
    pathname ?? withDocsBasePath("/", DOCS_LOCALE),
  );

  useEffect(() => {
    const syncCurrentUrl = () => setCurrentUrl(getCurrentBrowserUrl());

    syncCurrentUrl();
    window.addEventListener("hashchange", syncCurrentUrl);
    window.addEventListener("popstate", syncCurrentUrl);

    return () => {
      window.removeEventListener("hashchange", syncCurrentUrl);
      window.removeEventListener("popstate", syncCurrentUrl);
    };
  }, [pathname]);

  const rememberLocale = (locale: DocsLocale) => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // A blocked storage API must not block the anchor's full navigation.
    }
  };

  const activateLocale = (
    event: MouseEvent<HTMLAnchorElement>,
    locale: DocsLocale,
  ) => {
    event.currentTarget.setAttribute(
      "href",
      switchLocaleUrl(getCurrentBrowserUrl(), locale),
    );
    rememberLocale(locale);
  };

  return (
    <div
      role="group"
      aria-label="语言 / Language"
      className="inline-flex h-11 shrink-0 items-center rounded-[min(var(--radius),0.5rem)] border border-border bg-surface text-xs font-medium"
    >
      {localeOptions.map(({ locale, label, ariaLabel }) => {
        const current = locale === DOCS_LOCALE;
        return (
          <a
            key={locale}
            href={switchLocaleUrl(currentUrl, locale)}
            hrefLang={locale}
            lang={locale}
            aria-label={ariaLabel}
            data-i18n-allow-cjk={locale === "zh-CN" ? "" : undefined}
            aria-current={current ? "page" : undefined}
            onClick={(event) => activateLocale(event, locale)}
            className={`inline-flex h-full min-w-11 items-center justify-center rounded-[min(var(--radius),0.375rem)] px-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg ${
              current
                ? "bg-surface-hover text-foreground"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
