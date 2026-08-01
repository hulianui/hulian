import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@hulianui/ui";
import { themeScript } from "./theme-script";
import { MswProvider } from "../components/msw-provider";
import { RouteProgress } from "../components/route-progress";
import { RegionMirrorBanner } from "../components/region-mirror-banner";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../lib/site";

export const metadata: Metadata = {
  // metadataBase 决定所有相对 URL（og:image / canonical）解析的基准。
  // 缺它 → Next 回退到 localhost:3000，全站分享图失效。必须指向主站权威域。
  metadataBase: new URL(SITE_URL),
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
  applicationName: SITE_NAME,
  authors: [{ name: "瑚琏 Abel" }],
  // Google Search Console 站点验证（meta 标签法）。另有 public/google*.html 文件法双保险。
  verification: { google: "BAmlAt7dL6BpLmwByJZLoKqfl--ARBLLR68KUFxE-Is" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "zh_CN",
    title: "瑚琏 Hulian — 颜值 + 好用的 React 组件库",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider defaultSetting="system">
          <RouteProgress />
          <RegionMirrorBanner />
          <MswProvider>{children}</MswProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
