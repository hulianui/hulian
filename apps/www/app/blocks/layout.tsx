import type { ReactNode } from "react";
import { ToastProvider, ModalProvider, NotificationProvider } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";

// 区块画廊外壳 —— 与「示例」(/demos) 同级的独立画廊，不进组件文档的 Layout 侧栏外壳。
export default function BlocksLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteNavbar />
      <main>{children}</main>
      {/* 命令式 overlay 全局单挂，供区块内的 toast()/modal.*() 等触发（如联系表单提交反馈）。 */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
