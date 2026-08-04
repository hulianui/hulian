import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getIntlayer } from "next-intlayer";
import { Card, Heading, Tag, Text } from "@hulianui/ui";
import { pages, pageMeta } from "./_meta";
import { pagePreviews } from "./_registry";
import { PreviewThumbnail } from "../../components/preview-thumbnail";
import { GalleryBrowser } from "../../components/gallery-browser";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("pages", DOCS_LOCALE).index;

export const metadata: Metadata = {
  title: `${content.metadataTitle}`,
  description: `${content.description}`,
};

// 页面画廊 —— 每张卡渲染整页真实缩略图(FitScreen 缩放·设计高度调大多露几屏)。
//
// 20 个整页此前全部当活组件同时挂载（顶层 6000+ 节点）；PreviewThumbnail 默认按需挂载后，
// 首屏之外的整页不进 DOM、不跑 effect、不发图片请求。
export default function PagesGalleryPage() {
  const cards = Object.fromEntries(
    pages.map((p) => {
      const display = pageMeta(p);
      return [
        p.slug,
        <Card
          key={p.slug}
          variant="outline"
          className="group relative mb-6 block break-inside-avoid overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
        >
          <div className="border-b border-border bg-surface/40 p-3">
            <div className="overflow-hidden rounded-[var(--radius-sm,0.5rem)] border border-border bg-bg shadow-sm">
              {/* 整页很高,缩略图只露「首屏 + 一屏」即可,封顶 360px 让瀑布流卡片高度收敛、更整齐。 */}
              <PreviewThumbnail maxHeight={360}>{pagePreviews[p.slug]()}</PreviewThumbnail>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <Heading level={2} size="base" weight="semibold">
                {display.name}
              </Heading>
              <Tag variant="soft" tone="neutral" size="sm" className="shrink-0">
                {display.categoryLabel}
              </Tag>
            </div>
            <Text tone="muted" size="sm">
              {display.description}
            </Text>
          </div>
          <Link
            href={`/pages/${p.slug}`}
            aria-label={display.name}
            className="absolute inset-0 z-10 rounded-[inherit] focus:outline-none"
          />
        </Card>,
      ];
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8">
        <Heading level={1} size="3xl">
          {content.title}
        </Heading>
        <Text tone="muted" className="mt-2 max-w-2xl">
          {content.description}
        </Text>
      </header>

      <Suspense fallback={<div className="py-10 text-sm text-muted">{content.loading}</div>}>
        <GalleryBrowser
          type="page"
          items={pages.map((p) => ({ slug: p.slug, category: p.category }))}
          cards={cards}
          // 见 app/page.tsx 同处注释：intlayer 节点当字符串用必须显式转
          placeholder={String(content.searchPlaceholder)}
        />
      </Suspense>
    </div>
  );
}
