import type { ReactNode } from "react";
import { ToastProvider } from "@hulianui/ui";
import { SiteShell } from "../_components/site-shell";

// 个人站路由组：主页 / 作品详情 / 留言板 共用 SiteShell，挂一次 ToastProvider 供表单与留言反馈。
export default function PersonalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <ToastProvider />
    </>
  );
}
