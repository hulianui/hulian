import type { ReactNode } from "react";
import Link from "next/link";
import { Layout, ToastProvider, ModalProvider, NotificationProvider, AnimatedThemeToggler } from "@hulianui/ui";
import { ComponentTree } from "../../components/component-tree";
import { SectionTabs } from "../../components/section-tabs";
import { DocsBackTop } from "../../components/docs-back-top";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* 移动端顶部：bar + 可展开树 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link href="/" className="text-sm font-semibold">
            瑚琏 Hulian
          </Link>
          <AnimatedThemeToggler />
        </div>
        <details className="border-b border-border">
          <summary className="cursor-pointer px-4 py-2 text-sm text-muted">组件导航</summary>
          <div className="space-y-4 p-3">
            <SectionTabs />
            <ComponentTree />
          </div>
        </details>
      </div>

      {/* 桌面：dogfood 自家 Layout 搭外壳 —— 顶部 Header 横跨全宽，下方嵌套横向 Layout
          (Sider 装导航树 + Content 装正文)。外壳定高不滚(h-dvh+overflow-hidden)，
          Sider(内置 ScrollArea) 与 Content(overflow-auto) 各自独立滚动。放宽到 1760px 减少留白。 */}
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
                <ComponentTree />
              </div>
            </Layout.Sider>
            <Layout.Content className="px-6 py-10">
              {children}
              {/* dogfood：回顶钮挂到本滚动体（Layout.Content，非 window）*/}
              <DocsBackTop />
            </Layout.Content>
          </Layout>
        </Layout>
      </div>

      {/* 命令式 overlay 全局单挂：含各自 Viewport，toast()/modal.*()/notification.*() 在任意组件页触发都进此处。 */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
