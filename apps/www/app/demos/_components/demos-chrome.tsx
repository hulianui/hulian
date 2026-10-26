"use client";
import { usePathname, useRouter } from "next/navigation";
import { Fab } from "@hulianui/ui";
import { LayoutGrid } from "lucide-react";
import { SiteNavbar } from "../../../components/site-navbar";
import { stripDocsBasePath } from "../../../lib/docs-locale";
import { copy } from "./demos-chrome.content";

// /demos 路由的统一外壳 chrome（client，单挂在 demos/layout）：
// - 画廊页 `/demos` 本身 → 站点统一顶栏 SiteNavbar（四档导航 + 主题切换），与区块/页面画廊一致；
// - 任意 demo 子页 `/demos/<slug>/…` → 不占布局的「返回示例库」悬浮 Fab 胶囊，
//   各 demo 自带主题切换，故此处只管「回画廊」。
export function DemosChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const bare = stripDocsBasePath(pathname);
  const onGallery = bare === "/demos";
  // ai-workflow 的返回在工作室顶栏。
  // 小说站自带顶栏。阅读页左右缘是翻页热区，左下角悬浮按钮会挡住向后翻，
  // 返回示例库放在唤出菜单的角落。
  const ownsBackAffordance =
    bare.startsWith("/demos/ai-workflow") || bare.startsWith("/demos/novel");

  if (ownsBackAffordance) return null;

  if (onGallery) return <SiteNavbar />;

  return (
    <Fab
      label={copy("backToGallery")}
      icon={<LayoutGrid className="size-5" aria-hidden />}
      position="bottom-left"
      draggable
      aria-label={copy("backToGallery")}
      onClick={() => router.push("/demos")}
    />
  );
}
