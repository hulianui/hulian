import type { ReactNode } from "react";
import { ModalProvider, ToastProvider } from "@hulianui/ui";
import { LearnShell } from "../_components/learn-shell";

// (app) 路由组：所有学习端页面共享 LearnShell（顶栏 + 共享学习态 + 页脚）。
// toast / popconfirm 走模块级单例，需要 Provider 渲染出口；此前 learn 子树没挂，报名 / 笔记的 toast 没有地方显示。
export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <LearnShell>
      {children}
      <ToastProvider />
      <ModalProvider />
    </LearnShell>
  );
}
