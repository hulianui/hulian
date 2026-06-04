import type { ReactNode } from "react";
import { BackTop, ModalProvider, NotificationProvider, ToastProvider, Watermark } from "@hulian/ui";
import { CrmShell } from "../_components/crm-shell";

// CRM 后台外壳：route group (app) 把侧栏/顶栏/页签套在所有业务页上（登录页在 group 外，无外壳）。
// 挂全局反馈 Provider（toast/modal/notification 走模块级单例，需各自 Provider 渲染出口）。
// Watermark 覆盖整个外壳区，pointer-events:none 不影响交互；BackTop 给长列表页提供回顶。
export default function CrmAppLayout({ children }: { children: ReactNode }) {
  return (
    <Watermark content="瑚琏 CRM · 演示" opacity={0.08} className="h-dvh">
      <CrmShell>{children}</CrmShell>
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
      <BackTop />
    </Watermark>
  );
}
