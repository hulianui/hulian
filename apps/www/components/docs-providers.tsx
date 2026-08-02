"use client";

import type { ReactNode } from "react";
import { IntlayerClientProvider } from "next-intlayer";
import { ConfigProvider, enUS, ThemeProvider, zhCN } from "@hulianui/ui";
import { DOCS_LOCALE } from "../lib/docs-locale";

export function DocsProviders({ children }: { children: ReactNode }) {
  return (
    <IntlayerClientProvider locale={DOCS_LOCALE}>
      <ConfigProvider locale={DOCS_LOCALE === "en" ? enUS : zhCN}>
        <ThemeProvider defaultSetting="system">{children}</ThemeProvider>
      </ConfigProvider>
    </IntlayerClientProvider>
  );
}
