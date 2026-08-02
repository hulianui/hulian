import { copy } from "./layout.content";
import type { ReactNode } from "react";
import { BackTop, ModalProvider, ToastProvider, Watermark } from "@hulianui/ui";

// 排班台外壳：挂全局反馈 Provider（toast/popconfirm 走模块级单例，需 Provider 渲染出口）。
export default function SchedulerLayout({ children }: { children: ReactNode }) {
  return (
    <Watermark content={copy("hanyoDemo")} opacity={0.08} className="h-dvh">
      {children}
      <ToastProvider />
      <ModalProvider />
      <BackTop />
    </Watermark>
  );
}
