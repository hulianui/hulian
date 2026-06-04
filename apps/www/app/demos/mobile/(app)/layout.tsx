import type { ReactNode } from "react";
import { MobileShell } from "../_components/mobile-shell";

// 手机 App 外壳 layout：手机 chrome + SafeArea + TabBar
export default function MobileAppLayout({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
