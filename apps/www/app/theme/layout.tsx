import type { ReactNode } from "react";
import { ThemeSidebar } from "../../components/theme-sidebar";
import { DocsShell } from "../../components/docs-shell";

// 与 /components 共用 DocsShell：顶栏统一走 SiteNavbar（原先这里自绘 brand + 主题切换的 Header，
// 少了分档导航/版本/开源入口，且移动端与桌面两套结构正是 #39 漂移的温床）。
export default function ThemeLayout({ children }: { children: ReactNode }) {
  return (
    <DocsShell navLabel="主题导航" nav={<ThemeSidebar />}>
      {children}
    </DocsShell>
  );
}
