import type { ReactNode } from "react";
import { ModalProvider, NotificationProvider, ToastProvider, Watermark } from "@hulianui/ui";
import { CsShell } from "../_components/cs-shell";

// 客服中心外壳：route group (app) 把侧栏/顶栏/页签套在所有业务页上（登录页在 group 外，无外壳）。
// 挂全局反馈 Provider（toast/modal/notification 走模块级单例，需各自 Provider 渲染出口）。
export default function CsAppLayout({ children }: { children: ReactNode }) {
  return (
    <Watermark content="瑚琏客服 · 演示" opacity={0.08} className="h-dvh">
      <CsShell>{children}</CsShell>
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </Watermark>
  );
}
