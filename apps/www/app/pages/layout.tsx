import type { ReactNode } from "react";
import { ToastProvider, ModalProvider, NotificationProvider } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";

// 页面画廊外壳 —— 与「区块 / 示例」同级的独立画廊。
export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteNavbar />
      <main>{children}</main>
      {/* 命令式 overlay 全局单挂(联系表单等会触发) */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
