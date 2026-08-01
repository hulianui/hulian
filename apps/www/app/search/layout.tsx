import type { ReactNode } from "react";
import { ToastProvider, ModalProvider, NotificationProvider } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";

// 搜索结果页外壳 —— 与画廊同级的独立页面，不进组件文档的侧栏外壳。
export default function SearchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteNavbar />
      <main>{children}</main>
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
