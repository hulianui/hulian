import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { themeScript } from "./theme-script";
import { DocsProviders } from "../components/docs-providers";
import { MswProvider } from "../components/msw-provider";
import { RouteProgress } from "../components/route-progress";
import { RegionMirrorBanner } from "../components/region-mirror-banner";
import { DOCS_LOCALE } from "../lib/docs-locale";
import { languageInitScript } from "../lib/language-init-script";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../lib/site";

const english = DOCS_LOCALE === "en";
const localizedSite = english
  ? {
      name: "Hulian UI",
      title: "Hulian UI — Beautiful, practical React components",
      description:
        "Hulian UI is a production-ready React component library and design system with 349+ components, OKLCH color, Tailwind CSS v4, dark mode, and source-first distribution.",
      keywords: [
        "Hulian UI",
        "hulianui",
        "React component library",
        "React UI library",
        "Design System",
        "Tailwind CSS v4",
        "admin components",
        "shadcn alternative",
      ],
    }
  : {
      name: SITE_NAME,
      title: "瑚琏 Hulian — 颜值 + 好用的 React 组件库",
      description: SITE_DESCRIPTION,
      keywords: [
        "瑚琏",
        "hulianui",
        "hulian ui",
        "React 组件库",
        "React UI 库",
        "设计系统",
        "Design System",
        "Tailwind CSS v4",
        "中后台组件",
        "shadcn 替代",
      ],
    };

export const metadata: Metadata = {
  // metadataBase 决定所有相对 URL（og:image / canonical）解析的基准。
  // 缺它 → Next 回退到 localhost:3000，全站分享图失效。必须指向主站权威域。
  metadataBase: new URL(SITE_URL),
  title: localizedSite.title,
  description: localizedSite.description,
  keywords: localizedSite.keywords,
  applicationName: localizedSite.name,
  authors: [{ name: english ? "Abel" : "瑚琏 Abel" }],
  // Google Search Console 站点验证（meta 标签法）。另有 public/google*.html 文件法双保险。
  verification: { google: "BAmlAt7dL6BpLmwByJZLoKqfl--ARBLLR68KUFxE-Is" },
  openGraph: {
    type: "website",
    siteName: localizedSite.name,
    locale: english ? "en_US" : "zh_CN",
    title: localizedSite.title,
    description: localizedSite.description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DOCS_LOCALE} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <DocsProviders>
          <RouteProgress />
          <RegionMirrorBanner />
          <MswProvider>{children}</MswProvider>
        </DocsProviders>
      </body>
    </html>
  );
}
