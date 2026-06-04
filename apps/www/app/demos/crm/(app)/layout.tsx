import type { ReactNode } from "react";
import { CrmShell } from "../_components/crm-shell";

// CRM 后台外壳：route group (app) 把侧栏/顶栏/页签套在所有业务页上（登录页在 group 外，无外壳）。
export default function CrmAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh">
      <CrmShell>{children}</CrmShell>
    </div>
  );
}
