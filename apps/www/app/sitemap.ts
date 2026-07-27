import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { manifest } from "../lib/manifest";
// 从纯数据 _meta 直接读，不走 _registry.tsx（那里挂了 React 预览组件，会污染 server sitemap 模块）。
import { blocks } from "./blocks/_meta";
import { pages } from "./pages/_meta";

// output:export 下强制静态生成 out/sitemap.xml。
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string): string => `${SITE_URL}${path}`;

  // 顶层内容/导航页与主题文档页。
  const staticPaths = [
    "/",
    "/components",
    "/blocks",
    "/pages",
    "/start",
    "/changelog",
    "/theme",
    "/theme/color",
    "/theme/typography",
    "/theme/spacing",
    "/theme/radius",
    "/theme/shadows",
    "/theme/breakpoints",
    "/theme/dark-mode",
    "/theme/cursors",
    "/demos",
  ];

  return [
    ...staticPaths.map((p) => ({
      url: at(p),
      changeFrequency: "weekly" as const,
      priority: p === "/" ? 1 : 0.7,
    })),
    // 349+ 组件文档页 —— SEO 主战场（长尾组件词的落地页）。
    ...manifest.map((m) => ({
      url: at(`/components/${m.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // 区块页。
    ...blocks.map((b) => ({
      url: at(`/blocks/${b.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // 整页页面。
    ...pages.map((p) => ({
      url: at(`/pages/${p.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
