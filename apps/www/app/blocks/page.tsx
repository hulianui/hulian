import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getIntlayer } from "next-intlayer";
import { Card, Heading, Tag, Text } from "@hulianui/ui";
import { blocks, blockMeta } from "./_meta";
import { blockPreviews } from "./_registry";
import { PreviewThumbnail } from "../../components/preview-thumbnail";
import { GalleryBrowser } from "../../components/gallery-browser";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("blocks", DOCS_LOCALE).index;

export const metadata: Metadata = {
  title: `${content.metadataTitle}`,
  description: `${content.description}`,
};

// 区块画廊 —— 每张卡渲染区块真实缩略图,先看到样子再点进详情。
// 卡片用 stretched-link:Link 是绝对定位覆盖层(非内容祖先),避免缩略图里区块自带的 <a> 被嵌套进卡片 <a>。
//
// 缩略图按需挂载(PreviewThumbnail 默认 lazy)：首屏之外的区块不进 DOM、不跑 effect。
// 搜索/分类筛选由 GalleryBrowser（client）承担，卡片本身仍是 RSC，按 slug 传进去。
export default function BlocksGalleryPage() {
  const cards = Object.fromEntries(
    blocks.map((b) => {
      const display = blockMeta(b);
      return [
        b.slug,
        <Card
          key={b.slug}
          variant="outline"
          className="group relative mb-6 block break-inside-avoid overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
        >
          {/* 缩略图:内嵌一层带阴影的小框,像「截图」 */}
          <div className="border-b border-border bg-surface/40 p-3">
            <div className="overflow-hidden rounded-[var(--radius-sm,0.5rem)] border border-border bg-bg shadow-sm">
              <PreviewThumbnail>{blockPreviews[b.slug]()}</PreviewThumbnail>
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
          {/* stretched-link 覆盖层:整卡可点,不做内容祖先 */}
          <Link
            href={`/blocks/${b.slug}`}
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

      {/* useSearchParams 需要 Suspense 边界（output:export 下缺了构建会报错）。 */}
      <Suspense fallback={<div className="py-10 text-sm text-muted">{content.loading}</div>}>
        <GalleryBrowser
          type="block"
          items={blocks.map((b) => ({ slug: b.slug, category: b.category }))}
          cards={cards}
          placeholder={content.searchPlaceholder}
        />
      </Suspense>
    </div>
  );
}
