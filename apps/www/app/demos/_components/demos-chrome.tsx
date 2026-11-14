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
  const ownsBackAffordance = bare.startsWith("/demos/ai-workflow");
  // 小说阅读页是全屏阅读器：唤出的底栏（全书/本章进度 + 目录/阅读设置）铺满视口底部，
  // Fab 用默认 bottom-6 会正好压住「目录」。这里只挂一个钩子类，抬高与回落交给
  // globals.css 的 :has([data-novel-chrome]) 联动 —— 底栏在时抬起，收起后回到底角。
  const novelReader = bare === "/demos/novel" || bare.startsWith("/demos/novel/read");

  if (ownsBackAffordance) return null;

  if (onGallery) return <SiteNavbar />;

  return (
    <Fab
      label={copy("backToGallery")}
      icon={<LayoutGrid className="size-5" aria-hidden />}
      position="bottom-left"
      className={novelReader ? "novel-fab-lift" : undefined}
      draggable
      aria-label={copy("backToGallery")}
      onClick={() => router.push("/demos")}
    />
  );
}
