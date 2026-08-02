import type { ReactNode } from "react";
import { FitScreen, GridPattern, ToastProvider } from "@hulianui/ui";

// 大屏外壳：全屏深色底 + 细网格纹理 + FitScreen 把 1920×1080 设计稿等比缩放铺满视口。
// 深色为默认观感，但全程走 token，跟随站点全局明暗切换。
export default function DashboardAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[var(--color-bg)]">
      {/* 纹理：dogfood GridPattern，极低对比仅作大屏底纹 */}
      <GridPattern
        width={48}
        height={48}
        className="pointer-events-none absolute inset-0 h-full w-full text-foreground/[0.035] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]"
      />
      {/* 顶/底渐隐光晕，强化大屏纵深 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/[0.06] to-transparent" />

      <FitScreen designWidth={1920} designHeight={1080} mode="fit" className="relative z-10">
        {children}
      </FitScreen>
      <ToastProvider />
    </div>
  );
}
