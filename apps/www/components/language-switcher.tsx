"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Segmented, cn } from "@hulianui/ui";
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

export function LanguageSwitcher({
  pathname,
  className,
}: {
  pathname?: string;
  /** 给外部分档用：顶栏在 <sm 藏起它、折叠菜单里再挂一份，靠调用方传 `max-sm:hidden` / `sm:hidden`。 */
  className?: string;
}) {
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

  // 一组链接（选中项 = 当前语言）：Segmented 的链接段，role="group" + aria-current="page"。
  return (
    <Segmented
      shape="pill"
      size="sm"
      value={DOCS_LOCALE}
      aria-label={content.languageGroup}
      className={cn("shrink-0", className)}
      items={localeOptions.map(({ locale, label, ariaLabel }) => ({
        value: locale,
        label,
        ariaLabel,
        render: (
          <a
            href={switchLocaleUrl(currentUrl, locale)}
            hrefLang={locale}
            lang={locale}
            onClick={(event) => activateLocale(event, locale)}
          />
        ),
      }))}
    />
  );
}
