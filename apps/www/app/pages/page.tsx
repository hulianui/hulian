import type { Metadata } from "next";
import Link from "next/link";
import { Card, Heading, Tag, Text } from "@hulianui/ui";
import { pages, CATEGORY_LABEL } from "./_meta";
import { pagePreviews } from "./_registry";
import { PreviewThumbnail } from "../../components/preview-thumbnail";

export const metadata: Metadata = { title: "页面 Pages · 瑚琏 Hulian" };

// 页面画廊 —— 每张卡渲染整页真实缩略图(FitScreen 缩放·设计高度调大多露几屏)。
export default function PagesGalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <Heading level={1} size="3xl">
          页面 Pages
        </Heading>
        <Text tone="muted" className="mt-2 max-w-2xl">
          由多个区块拼成的完整整页 —— 展示如何把区块组合成可上线的页面。代码即组合方式,复制后替换区块或调顺序即可。
        </Text>
      </header>

      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {pages.map((p) => (
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
                  {p.name}
                </Heading>
                <Tag variant="soft" tone="neutral" size="sm" className="shrink-0">
                  {CATEGORY_LABEL[p.category]}
                </Tag>
              </div>
              <Text tone="muted" size="sm">
                {p.description}
              </Text>
            </div>
            <Link
              href={`/pages/${p.slug}`}
              aria-label={p.name}
              className="absolute inset-0 z-10 rounded-[inherit] focus:outline-none"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
