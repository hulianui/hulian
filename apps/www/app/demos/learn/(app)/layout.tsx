import type { ReactNode } from "react";
import { LearnShell } from "../_components/learn-shell";

// (app) 路由组：所有学习端页面共享 LearnShell（顶栏 + 共享学习态 + 页脚）。
export default function LearnLayout({ children }: { children: ReactNode }) {
  return <LearnShell>{children}</LearnShell>;
}
