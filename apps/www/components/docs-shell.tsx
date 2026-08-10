import type { ReactNode } from "react";
import { Layout, ToastProvider, ModalProvider, NotificationProvider } from "@hulianui/ui";
import { SectionTabs } from "./section-tabs";
import { DocsBackTop } from "./docs-back-top";
import { SiteNavbar } from "./site-navbar";

// 文档外壳 —— /components 与 /theme 共用，避免两边各写一份再各自漂移（#39 就是这么漂出来的）。
//
// 核心约束：**正文只有一个渲染出口**（下方唯一的 Layout.Content）。
// 历史写法把 {children} 只放进 `hidden md:block` 的桌面分支，移动端整页只剩顶栏 + 折叠导航，
// 正文虽被生成但祖先 display:none。所以这里不再按断点分叉正文，只按断点改「外壳的高度与滚动体」：
//
//   - 移动端：外壳不定高、Sider display:none → Content 是唯一子项，随「文档」自然滚动。
//   - md+：外壳吃 SiteNavbar(4rem) 之外的整屏高度并定高不滚，Sider 与 Content 各自独立滚动。
//
// 导航树在移动折叠盘与桌面 Sider 各挂一份（沿用既有结构），它是导航不是正文，
// 两处任一被 CSS 隐藏都不影响正文可达。
export function DocsShell({
  navLabel,
  nav,
  contentClassName,
  children,
}: {
  /** 移动端折叠盘的标题，如「组件导航」。 */
  navLabel: string;
  /** 导航树（ComponentTree / ThemeSidebar）。 */
  nav: ReactNode;
  /** 追加到 Layout.Content 的类名（如组件文档的浅底）。 */
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {/* 站点统一顶栏(五档导航 + 品牌 + 版本 + 开源 + 主题切换)—— 与区块/页面/示例画廊共用。 */}
      <SiteNavbar />

      {/* 移动端：导航折叠盘。只装导航，正文不在此分支。 */}
      <details className="border-b border-border md:hidden">
        <summary className="cursor-pointer px-4 py-2 text-sm text-muted-foreground">{navLabel}</summary>
        <div className="space-y-4 p-3">
          <SectionTabs />
          {nav}
        </div>
      </details>

      <div className="mx-auto max-w-[1760px] md:h-[calc(100dvh-4rem)] md:overflow-hidden">
        {/* 移动端 Sider 被隐藏后 Layout 只剩 Content 一个 flex 子项，flex-row 不影响单列表现。 */}
        <Layout hasSider className="md:h-full">
          {/* `hidden md:flex` 经 cn(tailwind-merge) 覆盖 Sider 自带的 `flex`：display 同组、后者胜。
              Sider 的宽度是内联样式，display:none 时不参与布局，无需再压宽度。 */}
          <Layout.Sider width={240} className="hidden md:flex">
            <div className="space-y-4 p-3">
              <SectionTabs />
              {nav}
            </div>
          </Layout.Sider>
          <Layout.Content className={`px-4 py-8 md:px-6 md:py-10 ${contentClassName ?? ""}`}>
            {children}
            {/* dogfood：回顶钮的滚动体按断点变（桌面=Content，移动=window），见 DocsBackTop。 */}
            <DocsBackTop />
          </Layout.Content>
        </Layout>
      </div>

      {/* 命令式 overlay 全局单挂：含各自 Viewport，toast()/modal.*()/notification.*() 在任意文档页触发都进此处。 */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
