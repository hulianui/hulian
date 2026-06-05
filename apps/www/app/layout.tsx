import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, MuiBridgeProvider } from "@hulianui/ui";
import { themeScript } from "./theme-script";
import { MswProvider } from "../components/msw-provider";
import { RouteProgress } from "../components/route-progress";
import { RegionMirrorBanner } from "../components/region-mirror-banner";

export const metadata: Metadata = {
  title: "瑚琏 Hulian",
  description: "颜值 + 好用的 React 设计系统",
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
          <AppRouterCacheProvider options={{ key: "mui" }}>
            <MuiBridgeProvider>
              <MswProvider>{children}</MswProvider>
            </MuiBridgeProvider>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
