import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { manifest } from "../lib/manifest";
import {
  NESTED_LOCALE,
  ROOT_LOCALE,
  canonicalPathForLocale,
  type DocsLocale,
} from "../lib/docs-locale";
// 从纯数据 _meta 直接读，不走 _registry.tsx（那里挂了 React 预览组件，会污染 server sitemap 模块）。
import { blocks } from "./blocks/_meta";
import { pages } from "./pages/_meta";

// output:export 下强制静态生成 out/sitemap.xml。
export const dynamic = "force-static";

/**
 * 与语言无关的「裸路由」清单。每条裸路由会展开成两条 sitemap 记录（英文 + 中文），
 * 各自带完整 hreflang 备用链接。
 *
 * 上一版只提交了单一语种的 URL，另一语种从未进过 sitemap —— 搜索引擎只能靠跟 hreflang
 * 被动发现，是英文落地页长期拿不到品牌词的直接原因。此处两个语种一律显式提交。
 */
function bareRoutes(): { path: string; priority: number }[] {
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
    ...staticPaths.map((path) => ({ path, priority: path === "/" ? 1 : 0.7 })),
    // 349+ 组件文档页 —— SEO 主战场（长尾组件词的落地页）。
    ...manifest.map((m) => ({ path: `/components/${m.slug}`, priority: 0.8 })),
    ...blocks.map((b) => ({ path: `/blocks/${b.slug}`, priority: 0.6 })),
    ...pages.map((p) => ({ path: `/pages/${p.slug}`, priority: 0.6 })),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  // canonicalPathForLocale 保证嵌套语言首页写成 "/zh/"：静态托管会把 "/zh" 308 到 "/zh/"，
  // sitemap 里放会跳转的 URL 会被判为「带重定向的网页」而不予收录。
  const at = (path: string, locale: DocsLocale): string =>
    `${SITE_URL}${canonicalPathForLocale(path, locale)}`;

  return bareRoutes().flatMap(({ path, priority }) =>
    [ROOT_LOCALE, NESTED_LOCALE].map((locale) => ({
      url: at(path, locale),
      changeFrequency: "weekly" as const,
      priority,
      // 双向 hreflang：两个语种互指，x-default 指向根语言（英文），
      // 让搜索引擎按用户语言投对应版本，而不是把两份当重复内容二选一。
      alternates: {
        languages: {
          "zh-CN": at(path, "zh-CN"),
          en: at(path, "en"),
          "x-default": at(path, ROOT_LOCALE),
        },
      },
    })),
  );
}
