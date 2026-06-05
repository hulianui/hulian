"use client";
import { usePathname, useRouter } from "next/navigation";
import { Fab } from "@hulianui/ui";
import { LayoutGrid } from "lucide-react";
import { SiteNavbar } from "../../../components/site-navbar";

// /demos 路由的统一外壳 chrome（client，单挂在 demos/layout）：
// - 画廊页 `/demos` 本身 → 站点统一顶栏 SiteNavbar（四档导航 + 主题切换），与区块/页面画廊一致；
// - 任意 demo 子页 `/demos/<slug>/…` → 不占布局的「返回示例库」悬浮 Fab 胶囊，
//   各 demo 自带主题切换，故此处只管「回画廊」。
export function DemosChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const onGallery = pathname === "/demos";
  // ai-workflow 是全屏工作室、底部常驻运行面板，悬浮 Fab 会盖住面板，
  // 故其「返回示例库」改放工作室顶栏（见 studio-shell），此处不渲染悬浮件。
  const ownsBackAffordance = pathname.startsWith("/demos/ai-workflow");

  if (ownsBackAffordance) return null;

  if (onGallery) return <SiteNavbar />;

  return (
    <Fab
      label="返回示例库"
      icon={<LayoutGrid className="size-5" aria-hidden />}
      position="bottom-left"
      draggable
      aria-label="返回示例库"
      onClick={() => router.push("/demos")}
    />
  );
}
