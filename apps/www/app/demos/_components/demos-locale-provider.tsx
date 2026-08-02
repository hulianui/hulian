"use client";

import type { ReactNode } from "react";
import { ConfigProvider, enUS, zhCN } from "@hulianui/ui";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

export function DemosLocaleProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider locale={DOCS_LOCALE === "en" ? enUS : zhCN}>{children}</ConfigProvider>;
}
