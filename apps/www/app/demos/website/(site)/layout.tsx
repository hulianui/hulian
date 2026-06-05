import type { ReactNode } from "react";
import { ToastProvider } from "@hulianui/ui";
import { SiteShell } from "../_components/site-shell";

// 营销站路由组：所有官网页共用 SiteShell（Navbar + Footer），并挂一次 ToastProvider 供联系表单反馈。
export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <ToastProvider />
    </>
  );
}
