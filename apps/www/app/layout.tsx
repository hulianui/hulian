import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@hulian/ui";
import { themeScript } from "./theme-script";

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
        <ThemeProvider defaultSetting="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
