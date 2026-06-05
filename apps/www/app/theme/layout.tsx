import type { ReactNode } from "react";
import Link from "next/link";
import { Layout, ToastProvider, ModalProvider, NotificationProvider, AnimatedThemeToggler } from "@hulianui/ui";
import { ThemeSidebar } from "../../components/theme-sidebar";
import { SectionTabs } from "../../components/section-tabs";

export default function ThemeLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* 移动端顶部：bar + 可展开导航 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link href="/" className="text-sm font-semibold">
            瑚琏 Hulian
          </Link>
          <AnimatedThemeToggler />
        </div>
        <details className="border-b border-border">
          <summary className="cursor-pointer px-4 py-2 text-sm text-muted">主题导航</summary>
          <div className="space-y-4 p-3">
            <SectionTabs />
            <ThemeSidebar />
          </div>
        </details>
      </div>

      {/* 桌面：与 /components 同构 dogfood Layout —— Header 横跨全宽 + 嵌套 Sider/Content，放宽到 1760px。 */}
      <div className="mx-auto hidden h-dvh max-w-[1760px] overflow-hidden md:block">
        <Layout className="h-full">
          <Layout.Header className="justify-between">
            <Link href="/" className="text-sm font-semibold">
              瑚琏 Hulian
            </Link>
            <AnimatedThemeToggler />
          </Layout.Header>
          <Layout hasSider className="min-h-0 flex-auto">
            <Layout.Sider width={240}>
              <div className="space-y-4 p-3">
                <SectionTabs />
                <ThemeSidebar />
              </div>
            </Layout.Sider>
            <Layout.Content className="px-6 py-10">{children}</Layout.Content>
          </Layout>
        </Layout>
      </div>

      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
