import type { ReactNode } from "react";
import { BillingShell } from "../_components/billing-shell";

// (app) 路由组：所有控制台页共享 BillingShell（侧栏 + 顶栏 + 共享订阅/支付内存态）。
export default function BillingAppLayout({ children }: { children: ReactNode }) {
  return <BillingShell>{children}</BillingShell>;
}
