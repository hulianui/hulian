import type { ReactNode } from "react";
import { ToastProvider } from "@hulianui/ui";
import { OrgStoreProvider } from "../_lib/org-store";
import { OrgShell } from "../_components/shell";

// (app) 路由组：登录之外的所有页面共享组织数据、侧栏与多页签。
export default function OrgClassroomAppLayout({ children }: { children: ReactNode }) {
  return (
    <OrgStoreProvider>
      <OrgShell>{children}</OrgShell>
      <ToastProvider />
    </OrgStoreProvider>
  );
}
