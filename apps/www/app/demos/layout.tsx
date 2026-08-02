import type { ReactNode } from "react";
import { DemosChrome } from "./_components/demos-chrome";
import { DemosLocaleProvider } from "./_components/demos-locale-provider";

export default function DemosLayout({ children }: { children: ReactNode }) {
  // 不再强加顶栏：画廊页自带页眉、demo 子页用「返回示例库」悬浮 Fab —— 二者都由 DemosChrome 按路由切换。
  return (
    <DemosLocaleProvider>
      <div className="min-h-dvh">
        <DemosChrome />
        {children}
      </div>
    </DemosLocaleProvider>
  );
}
