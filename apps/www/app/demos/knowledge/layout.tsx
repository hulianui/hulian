import type { ReactNode } from "react";
import { ToastProvider } from "@hulian/ui";

// 知识库单路由：挂一次 ToastProvider，供全程增删改 toast 反馈。
export default function KnowledgeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
