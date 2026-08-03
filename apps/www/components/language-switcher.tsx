"use client";

import { useEffect, useState, type MouseEvent } from "react";
import {
  DOCS_LOCALE,
  LOCALE_STORAGE_KEY,
  switchLocaleUrl,
  withDocsBasePath,
  type DocsLocale,
} from "../lib/docs-locale";
import { sharedChromeContent } from "./shared-chrome.data";

function getCurrentBrowserUrl() {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

export function LanguageSwitcher({ pathname }: { pathname?: string }) {
  const content = sharedChromeContent[DOCS_LOCALE];
  const localeOptions = [
    { locale: "zh-CN", label: content.chinese, ariaLabel: content.switchChinese },
    { locale: "en", label: content.english, ariaLabel: content.switchEnglish },
  ] as const;
  const [currentUrl, setCurrentUrl] = useState(
    () => pathname ?? withDocsBasePath("/", DOCS_LOCALE),
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
    // The Chinese mirror's nginx sends the root path to /zh — that is its whole reason to
    // exist — but the English home page *is* the root path. Without a server-readable
    // signal that the reader picked English on purpose, switching bounces straight back to
    // Chinese. localStorage is invisible to nginx, hence a cookie; the value is the one the
    // mirror's `map` matches (deploy/nginx/hulianui-zh.haloritual.com.conf).
    try {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      const value = locale === "en" ? "en" : "zh";
      document.cookie = `hl_locale=${value}; path=/; max-age=31536000; SameSite=Lax${secure}`;
    } catch {
      // Same as above — a blocked cookie jar must not block navigation.
    }
  };

  const activateLocale = (event: MouseEvent<HTMLAnchorElement>, locale: DocsLocale) => {
    event.currentTarget.setAttribute("href", switchLocaleUrl(getCurrentBrowserUrl(), locale));
    rememberLocale(locale);
  };

  return (
    <div
      role="group"
      aria-label={content.languageGroup}
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
