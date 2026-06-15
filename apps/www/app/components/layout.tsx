import type { ReactNode } from "react";
import { Layout, ToastProvider, ModalProvider, NotificationProvider } from "@hulianui/ui";
import { ComponentTree } from "../../components/component-tree";
import { SectionTabs } from "../../components/section-tabs";
import { DocsBackTop } from "../../components/docs-back-top";
import { SiteNavbar } from "../../components/site-navbar";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* 站点统一顶栏(四档导航 + 品牌 + 主题切换)—— 与区块/页面/示例画廊共用，组件文档由此也能跨档跳转。 */}
      <SiteNavbar />

      {/* 移动端：导航树折叠盘（品牌/分档/主题切换已由 SiteNavbar 提供，此处只补组件树） */}
      <details className="border-b border-border md:hidden">
        <summary className="cursor-pointer px-4 py-2 text-sm text-muted">组件导航</summary>
        <div className="space-y-4 p-3">
          <SectionTabs />
          <ComponentTree />
        </div>
      </details>

      {/* 桌面：dogfood 自家 Layout 搭外壳 —— SiteNavbar 占顶 4rem，外壳吃剩余视口高度(calc)并定高不滚，
          Sider(内置 ScrollArea) 与 Content(overflow-auto) 各自独立滚动。放宽到 1760px 减少留白。 */}
      <div className="mx-auto hidden h-[calc(100dvh-4rem)] max-w-[1760px] overflow-hidden md:block">
        <Layout hasSider className="h-full">
          <Layout.Sider width={240}>
            <div className="space-y-4 p-3">
              <SectionTabs />
              <ComponentTree />
            </div>
          </Layout.Sider>
          <Layout.Content className="bg-muted/[0.045] px-6 py-10">
            {children}
            {/* dogfood：回顶钮挂到本滚动体（Layout.Content，非 window）*/}
            <DocsBackTop />
          </Layout.Content>
        </Layout>
      </div>

      {/* 命令式 overlay 全局单挂：含各自 Viewport，toast()/modal.*()/notification.*() 在任意组件页触发都进此处。 */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
