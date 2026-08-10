import Link from "next/link";
import { AnimatedThemeToggler } from "@hulianui/ui";
import { getIntlayer } from "next-intlayer";
import { DOCS_LOCALE } from "../lib/docs-locale";

const content = getIntlayer("shared-chrome", DOCS_LOCALE);

// 画廊顶栏 —— 区块 / 页面 等独立画廊共用的轻量页眉（区别于组件文档的 Layout 外壳）。
// 左侧品牌 + 当前画廊面包屑（既当标题又当返回入口，详情页点它回画廊），右侧主题切换。
export function GalleryTopBar({ label, href }: { label: string; href: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-6 py-3 backdrop-blur">
      <nav className="flex items-center gap-2 text-sm" aria-label={String(content.breadcrumb)}>
        <Link href="/" className="font-semibold">
          {content.brand}
        </Link>
        <span className="text-muted-foreground/50" aria-hidden>
          /
        </span>
        <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
          {label}
        </Link>
      </nav>
      <AnimatedThemeToggler aria-label={String(content.toggleTheme)} />
    </header>
  );
}
