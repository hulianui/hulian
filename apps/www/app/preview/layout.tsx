import type { ReactNode } from "react";
import { ToastProvider, ModalProvider, NotificationProvider } from "@hulianui/ui";

// 隔离预览外壳 —— 刻意**不含** SiteNavbar、侧栏与文档站任何 chrome。
//
// 这条路由存在的意义就是「只有区块/页面本身」：既作详情页 iframe 的 src，也作「新窗口打开」
// 的落点。放在 /preview/* 而不是 /blocks/<slug>/preview，是因为 App Router 的布局会向下
// 复合 —— 挂在 /blocks 下就必然继承 blocks/layout.tsx 的顶栏，隔离也就无从谈起。
//
// overlay Provider 仍要挂：区块里的 toast()/modal.*() 得有落点，否则在隔离预览里点提交会静默无反应。
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      {children}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </div>
  );
}
